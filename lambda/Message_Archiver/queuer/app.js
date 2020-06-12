/*********************************************************************************************************************
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Apache License Version 2.0 (the 'License'). You may not use this file except in compliance        *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://www.apache.org/licenses/                                                                                   *
 *                                                                                                                    *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/
/**
 * @author rjlowe
 */
 const AWS = require('aws-sdk');
 AWS.config.update({
   region: process.env.AWS_REGION
 });

 const queueUrl = process.env.SQS_QUEUE_URL;

 const sqs = new AWS.SQS();

 const { createLogger, format, transports } = require('winston');
 const { combine, timestamp, label, printf } = format;
 const myFormat = printf(({ level, message, label, timestamp }) => {
   return `${timestamp} [${label}] ${level}: ${message}`;
 });
 const logger = createLogger({
   format: combine(
       label({ label: 'Amazon Pinpoint Message Archiver - Queuer' }),
       timestamp(),
       myFormat
   ),
   transports: [new transports.Console()]
 });

 exports.handler = async (event) => {

   const eventText = JSON.stringify(event);
   logger.log({
     level: 'info',
     message: eventText
   });

   try {

     // Loop over each Item from Firehose and Route to SQS for Async Processing
     const promises = [];
     const output = [];
     event.records.forEach(record => {

       output.push({
         data: record.data,
         recordId: record.recordId,
         result: 'Ok'
       });

       // Decode the base64 message
       const decoded = Buffer.from(record.data, 'base64').toString('ascii');

       logger.log({
         level: 'info',
         message: decoded
       });

       const obj = JSON.parse(decoded);
       if (obj.event_type === '_campaign.send' || obj.event_type === '_journey.send')  {

         promises.push(sqs.sendMessage({
           MessageBody: decoded,
           QueueUrl: queueUrl
         }).promise());
       }

     });
     // Return un-mutated record collection to Firehose
     return Promise.all(promises)
       .then(() => {
         return {records: output};
       });

   } catch (err) {
     logger.log({
       level: 'error',
       message: JSON.stringify(err)
     });
     return Promise.reject(err);
   }
 };
