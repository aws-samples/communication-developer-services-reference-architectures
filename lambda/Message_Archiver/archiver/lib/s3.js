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
const mimemessage = require('mimemessage');

AWS.config.update({
  region: process.env.AWS_REGION
});

const prefix = process.env.S3_PREFIX || 'archive/';

const s3 = new AWS.S3;

const s3Bucket = process.env.S3_BUCKET;

const writeRendered = function(rendered, endpointId, config) {

  if (rendered.length === 0) {return;}

  const d = new Date(config.eventTimestamp);


  const html = generateMimeBody(rendered, endpointId, config)

  return s3.putObject({
    Body: html,
    Bucket: s3Bucket,
    Key: prefix + endpointId + '/' + d.getFullYear() + '/' + pad(d.getMonth() + 1)  + '/' + pad(d.getDate()) + '/' + pad(d.getHours()) + '/' + uuidv4()
  }).promise();
};

function generateMimeBody(rendered, endpointId, config) {
  const msg = mimemessage.factory({
    contentType: 'multipart/mixed',
    body: []
  });

  // Add Mime Headers
  msg.header('EndpointId', endpointId);
  msg.header('ApplicationId', config.applicationId);
  msg.header('EventTimestamp', config.eventTimestamp);
  if (config.campaignId) {
    msg.header('CampaignId', config.campaignId);
    msg.header('TreatmentId', config.treatmentId);
  } else if (config.journeyId) {
    msg.header('JourneyId', config.journeyId);
    msg.header('JourneyActivityId', config.journeyActivityId);
  }

  msg.header('Channel', rendered[0].channel);

  const title = rendered.find(x => x.pieceType  === 'TITLE');
  if  (title) {
    msg.header('Subject/Title', title.html);
  }

  rendered.filter(x => x.pieceType !== 'TITLE').forEach((rendering) => {
    const piece = mimemessage.factory({
      contentType: 'multipart/mixed',
      body: rendering.html
    });
    piece.header('Content-Piece-Type', rendering.pieceType);
    msg.body.push(piece);
  });

  return msg.toString();

}


function pad(n){return n<10 ? '0'+n : n}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


module.exports = {writeRendered};
