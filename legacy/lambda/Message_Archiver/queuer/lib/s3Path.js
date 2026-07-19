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



const generateFilePath = function(endpointId, eventTimestamp) {

  const prefix = process.env.S3_PREFIX || 'archive';
  const s3Bucket = process.env.S3_BUCKET;

  const d = new Date(eventTimestamp);
  return 's3://' + s3Bucket + '/' + prefix + '/' + endpointId
    + '/' + d.getUTCFullYear() + '/' + pad(d.getUTCMonth() + 1)
    + '/' + pad(d.getUTCDate()) + '/' + pad(d.getUTCHours())
    + '/' + uuidv4();
}

function pad(n){return n<10 ? '0'+n : n}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


module.exports = {generateFilePath};
