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

'use strict';

let lib = require('./lib');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const myFormat = printf(({ level, message, label, requestId, module, timestamp }) => {
  return `${timestamp} [RequestId: ${requestId}] [${module}] ${level}: ${message}`;
});
const mainLogger = createLogger({
  format: combine(
      label({ label: 'Amazon Pinpoint Message Archiver - Archiver' }),
      timestamp(),
      myFormat
  ),
  transports: [new transports.Console()],
  level: process.env.LOG_LEVEL || 'notice'
});

exports.handler = async (event, context) => {

  const logger = mainLogger.child({requestId: context.awsRequestId});


  // Load the message passed into the Lambda function into a JSON object
  const eventText = JSON.stringify(event);
  logger.log({
    level: 'info',
    message: eventText,
    module: 'app.js'
  });

  try {
    const resp = await lib.process(event.Records, {
      logger
    });
    return Promise.resolve(resp);
  } catch (err) {
    logger.log({
      level: 'error',
      message: JSON.stringify(err),
      module: 'app.js'
    });
    return Promise.reject(err);
  }
};
