const decompress = require('decompress');
const path = require('path');
const fs = require('fs')
const AWS = require('aws-sdk');
const pinpoint = new AWS.Pinpoint()
const s3 = new AWS.S3();
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const log = require('loglevel');
const csv = require('csvtojson');
const { v4: uuidv4 } = require('uuid');
log.setLevel(process.env.LOG_LEVEL || 'info');

const pinpointAppId = process.env.PINPOINT_APP_ID;
const queueURL = process.env.SQS_QUEUE_URL;

//this will come from S3 Trigger
//var tarball = 'amplitude_cohort_example.tar.gz';
var dest    = '/tmp';

//Helper Functions
async function decompressFile(filePath, destination) {
    try {
        var results = await decompress(filePath, destination, {
            filter: file => path.extname(file.path) === '.csv'
        }).then(files => {
            log.info(files);
            return files;
        })
        return results;
    }
    catch (err){
        log.error(err, err.stack);
    }
}

async function getSegments(applicationId) {
    var params = {
        ApplicationId: applicationId
    };
    
    try {
        var data = await pinpoint.getSegments(params).promise();
        log.trace(data)
        return data.SegmentsResponse.Item;
    }
    catch (err){
        log.error(err, err.stack);
    }
}

async function getFile(s3Bucket, s3Key) {
    var filename = s3Key.replace('input/','');

    var params = {
        Key: s3Key,
        Bucket: s3Bucket
    }
    log.info(params)
    try {
        var results = await s3.getObject(params).promise();
        log.info('success');
        log.info(results)
        fs.writeFileSync(`/tmp/${filename}`, results.Body)
        log.debug(`file downloaded successfully: /tmp/${filename}`);
        return `/tmp/${filename}`;
    }
    catch (err){
        log.info('error');
        log.error(err, err.stack);
    }
}

async function createSegment(applicationId, cohort) {
    var userAttributes = {}
    userAttributes[`AMP_Cohort_${cohort}`] = {
        "AttributeType": "INCLUSIVE",
        "Values": [
            'Active'
        ]
    };

    var params = {
        ApplicationId: applicationId,
        WriteSegmentRequest: {
            "Name": `AMP_Cohort_${cohort}`,
            "SegmentGroups": {
                "Groups": [
                    {
                        "Dimensions": [
                            {
                                "UserAttributes": userAttributes
                            }
                        ],
                        "SourceSegments": [],
                        "SourceType": "ANY",
                        "Type": "ANY"
                    }
                ],
                "Include": "ALL"
            }
        }
    };

    try {
        var data = await pinpoint.createSegment(params).promise();
        log.trace(data)
        return data
    }
    catch (err){
        log.error(err, err.stack);
    }
}

async function sendMessageToQueue(applicationId, endpoint, cohort, action){

    endpoint.action = action;
    endpoint.applicationId = applicationId;
    endpoint.cohort = cohort;
    var msgBody = JSON.stringify(endpoint);

    var params = {
       MessageBody: msgBody,
       //MessageDeduplicationId: `${applicationId}_${cohort}_${endpoint.amplitude_id}`,  // Required for FIFO queues
       MessageDeduplicationId: uuidv4(), //TODO: making this unique for now, but may want to make this smarter above in the future?
       MessageGroupId: "Amplitude",  // Required for FIFO queues
       QueueUrl: queueURL
     };
     
     try {
        var data = await sqs.sendMessage(params).promise();
        log.trace(data.MessageId)
        return data.MessageId
    }
    catch (err){
        log.error(err, err.stack);
    }
}

async function main(event){

    var s3Bucket = event.Records[0].s3.bucket.name;
    var s3Key = event.Records[0].s3.object.key;
    log.info(s3Bucket);
    log.info(s3Key);
    let tarball = await getFile(s3Bucket,s3Key);
    log.info(tarball);


    let files = await decompressFile(tarball, dest);
    log.info(files);

    //Parse File Name
    var nameParts = files[0].path.split('_');
    var cohort;
    var enteringFilename, exitingFilename, existingFilename = null;

    files.forEach(file => {
        if (file.path.indexOf('entering_Active_Users') > -1){
            enteringFilename = file.path;
            cohort = enteringFilename.substring(enteringFilename.indexOf('_entering_') + 10).replace('.csv',''); //TODO: this is delicate, but couldn't find a better way since no good chars to split on.
        } else if (file.path.indexOf('exiting_Active_Users') > -1){
            exitingFilename = file.path;
        } else if (file.path.indexOf('existing_Active_Users') > -1){
            existingFilename = file.path;
        }
    });

    let segments = await getSegments(pinpointAppId);
    log.info(JSON.stringify(segments, null, 2));

    var segmentExists = false;
    segments.forEach(segment => {
        if (segment.Name === `AMP_Cohort_${cohort}`){
            segmentExists = true;
        }
    });

    if (!segmentExists){
        let newSegment = await createSegment(pinpointAppId, cohort);
    }

    //TODO: DRY
    //Process Entering
    log.debug(enteringFilename)
    const entering = await csv().fromFile(`/tmp/${enteringFilename}`);
    log.debug(entering.length);

    var scrubbedEntering = []
    entering.forEach((row, index) => {
        if (row.email !== ''){
            scrubbedEntering.push(row);
        }
    });
    log.debug(`scrubbedEntering: ${scrubbedEntering.length}`);

    //Add to SQS Queue
    for(var i=0; i<scrubbedEntering.length; ++i){
    //for(var i=0; i<=10; i++){
        let result = await sendMessageToQueue(pinpointAppId, scrubbedEntering[i], cohort, 'entering');
    }

    //Process Existing
    log.debug(existingFilename)
    const existing = await csv().fromFile(`/tmp/${existingFilename}`);
    log.debug(existing.length);

    var scrubbedExisting = []
    existing.forEach((row, index) => {
        if (row.email !== ''){
            scrubbedExisting.push(row);
        }
    });
    log.debug(`scrubbedExisting: ${scrubbedExisting.length}`);

    //Add to SQS Queue
    for(var i=0; i<scrubbedExisting.length; ++i){
        let result = await sendMessageToQueue(pinpointAppId, scrubbedExisting[i], cohort, 'existing');
    }

    //Process Exiting
    log.debug(exitingFilename)
    const exiting = await csv().fromFile(`/tmp/${exitingFilename}`);
    log.debug(exiting.length);

    var scrubbedExiting = []
    exiting.forEach((row, index) => {
        if (row.email !== ''){
            scrubbedExiting.push(row);
        }
    });
    log.debug(`scrubbedExiting: ${scrubbedExiting.length}`);

    //Add to SQS Queue
    for(var i=0; i<scrubbedExiting.length; ++i){
        let result = await sendMessageToQueue(pinpointAppId, scrubbedExiting[i], cohort, 'exiting');
    }
}

//main(event);
exports.handler = async (event, context) => {
    // All log statements are written to CloudWatch by default. For more information, see
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
    log.info(JSON.stringify(event));
    await main(event);
}