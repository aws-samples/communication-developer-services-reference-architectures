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

const AWS = require('aws-sdk');
AWS.config.update({
 region: process.env.AWS_REGION
});

const queueUrl = process.env.SQS_QUEUE_URL;
const sqs = new AWS.SQS();

class Queuer {

  /**
   * @class EventProcessor
   * @constructor
   */
  constructor(options) {
      this.options = {}
      this.options.logger = options.logger.child({module: 'lib/queuer.js'});
  }

  sendEventForAchiving(mutatedEvent) {
    this.options.logger.log({
      level: 'info',
      message: mutatedEvent
    });

    return sqs.sendMessage({
      MessageBody: mutatedEvent,
      QueueUrl: queueUrl
    }).promise();
  }
}


module.exports = Queuer;
