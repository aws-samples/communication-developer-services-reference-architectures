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

const EventProcessor = require('./processor.js');

const process = async (records, options) => {

  const logger = options.logger.child({
    module: 'lib/index.js'
  });

  const processor = new EventProcessor(options);

  try {

    return processor.processRecords(records)
      .then((mutated_records) => {
        return { records: mutated_records };
      });

  } catch (err) {
    logger.log({
      level: 'error',
      message: JSON.stringify(err)
    });
    return Promise.reject(err);
  }
}

module.exports = {
  process
};
