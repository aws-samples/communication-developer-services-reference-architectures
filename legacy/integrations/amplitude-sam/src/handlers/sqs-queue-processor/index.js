const AWS = require('aws-sdk');
const pinpoint = new AWS.Pinpoint()
const log = require('loglevel');
log.setLevel(process.env.LOG_LEVEL || 'info');

const attributesToIgnore = [
    'amplitude_id',
    'user_id',
    'email',
    'applicationId',
    'cohort',
    'action'
]

async function getUserEndpoints(applicationId, userId) {
    var params = {
        ApplicationId: applicationId,
        UserId: userId
    };
    
    try {
        var data = await pinpoint.getUserEndpoints(params).promise();
        log.trace(data)
        return data.EndpointsResponse.Item;
    }
    catch (err){
        log.error(err, err.stack);
    }
}

async function upsertEndpoints(records) {
    var endpoints = []

    //"amplitude_id","user_id","amplitude_id","name","a_prop","persona","username","email"
    for(var i=0; i<records.length; ++i) {
        endpoint = JSON.parse(records[i].body);

        userAttributes = {};
        switch (endpoint.action) {
            case 'entering':
            case 'existing':
                userAttributes[`AMP_Cohort_${endpoint.cohort}`] = ['Active'];
                break;

            case 'exiting':
                userAttributes[`AMP_Cohort_${endpoint.cohort}`] = ['InActive'];
                break;
        }

        //Populate User Attributes ignoring common attributes
        for (const [key, value] of Object.entries(endpoint)) {
            if(attributesToIgnore.indexOf(key) === -1){
                userAttributes[`AMP_${key}`] = [value]
            }
        }

        endpoints.push(
            {
                Address: endpoint.email,
                ChannelType: 'EMAIL',
                Id: endpoint.amplitude_id, //Is this unique per endpoint?
                User: {
                  UserAttributes: userAttributes,
                  UserId: endpoint.user_id
                }
              }
        )
    };

    var params = {
        ApplicationId: endpoint.applicationId,
        EndpointBatchRequest: {
            Item: endpoints
        }
    };

    log.trace(JSON.stringify(params, null, 2));

    try {
        var data = await pinpoint.updateEndpointsBatch(params).promise();
        log.trace(data)
        log.debug(`Upserted ${endpoints.length} endpoints.`);
        return data
    }
    catch (err){
        log.error(err, err.stack);
    }
}

exports.handler = async (event, context) => {
    // All log statements are written to CloudWatch by default. For more information, see
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
    log.trace(JSON.stringify(event));
    let result = await upsertEndpoints(event.Records);
    log.info(`Successfully processed ${event.Records.length} endpoints`);
}
