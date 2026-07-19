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

const Queuer = require('./queuer.js');
const { generateFilePath } = require('./s3Path.js');

class EventProcessor {

  /**
   * @class EventProcessor
   * @constructor
   */
  constructor(options) {
      this.options = {}
      this.options.logger = options.logger.child({module: 'lib/processor.js'});
      this.journeyCampaignEventTypes = ['_campaign.send', '_journey.send'];
      this.queuer = new Queuer(options);

  }

  processRecords(records) {
    return records.reduce((p, record) => {
      return p.then((out) => {
        return this.promiseFromRecord(record)
          .then((currentOut) => {
            out.push(currentOut);
            return out;
          });
      });
    }, Promise.resolve([]));
  }

  promiseFromRecord(record, out) {

    // Decode the base64 message
    const decoded = Buffer.from(record.data, 'base64').toString('ascii');
    this.options.logger.log({
      level: 'info',
      message: decoded
    });

    const pinpointEvent = JSON.parse(decoded);

    const p = this.journeyCampaignEventTypes.includes(pinpointEvent.event_type)
      ? this.journeyCampaignEvent(pinpointEvent)
      : this.defaultEvent(record);

    return p.then((data) => {
      return {
        data,
        recordId: record.recordId,
        result: 'Ok'
      };
    });
  }

  journeyCampaignEvent(pinpointEvent) {

    // Pre-compute where the archived message will be stored in S3 so that
    // we can mutate the pinpointEvent object for reporting
    pinpointEvent.client_context.custom.message_archive_location = generateFilePath(pinpointEvent.client.client_id, pinpointEvent.event_timestamp);

    const mutatedEvent = JSON.stringify(pinpointEvent);

    return this.queuer.sendEventForAchiving(mutatedEvent)
      .then(() => {
        return Buffer.from(mutatedEvent).toString('base64');
      });
  }

  defaultEvent(record) {
    return Promise.resolve(record.data);
  }
}

module.exports = EventProcessor;
