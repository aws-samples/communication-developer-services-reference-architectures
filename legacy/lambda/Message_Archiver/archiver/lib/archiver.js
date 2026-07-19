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
const parse = require('url').parse;

AWS.config.update({
  region: process.env.AWS_REGION
});


class Archiver {

  /**
   * @class Renderer
   * @constructor
   */
  constructor(options) {
      this.options = {}
      this.options.logger = options.logger.child({module: 'lib/archiver.js'});
      this.s3 = new AWS.S3;
  }


  archive(rendered, endpointId, config, messageArchiveLocation) {

    if (rendered.length === 0) {return Promise.resolve('success');}

    const pathResult = this.parseS3FilePath(messageArchiveLocation);
    const html = this.generateMimeBody(rendered, endpointId, config);

    this.options.logger.log({
        level: 'info',
        message: JSON.stringify(pathResult)
    });

    return this.s3.putObject({
      Body: html,
      Bucket: pathResult.bucket,
      Key: pathResult.key
    }).promise()
      .then((results) => {
        this.options.logger.log({
            level: 'info',
            message: JSON.stringify(results)
        });
        return 'success';
      })
  };

  parseS3FilePath(path) {
    const uri = parse(path);
    uri.pathname = decodeURIComponent(uri.pathname || '');
    return {
      bucket: uri.hostname,
      key: uri.pathname.slice(1)
    };
  }

  generateMimeBody(rendered, endpointId, config) {
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

    // const title = rendered.find(x => x.pieceType  === 'TITLE');
    // if  (title) {
    //   msg.header('Subject_Title', title.html);
    // }

    // rendered.filter(x => x.pieceType !== 'TITLE').forEach((rendering) => {
    rendered.forEach((rendering) => {

      const piece = mimemessage.factory({
        contentType: 'multipart/mixed',
        body: rendering.html
      });
      piece.header('Content-Piece-Type', rendering.pieceType);
      msg.body.push(piece);
    });

    return msg.toString();

  }
}

module.exports = Archiver;
