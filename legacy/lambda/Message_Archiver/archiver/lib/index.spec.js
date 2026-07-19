'use strict';

const sinon = require('sinon');
const assert = require('chai').assert;
const expect = require('chai').expect;
const path = require('path');
const AWS = require('aws-sdk-mock');
AWS.setSDK(path.resolve('./node_modules/aws-sdk'));

const { process } = require('./index.js');
const PinpointLib = require('./pinpoint.js');
const RendererLib = require('./renderer.js');
const ArchiverLib = require('./archiver.js');

let sandbox;

const options = {
    logger: {
        log: function(m) {
            console.log(m);
        },
        child: function(m) {
          return options.logger;
        }
    }
}

describe('Index', function() {

    beforeEach(function() {
        sandbox = sinon.createSandbox();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('process should be successful with a valid record', function(done) {

      const _records = [
          {
              "messageId": "c6578ec3-4044-466d-9596-db37e9224451",
              "receiptHandle": "AQEBLPolk9cvjH07V9au5DGPgfdhWxs7lMx2WhYDWgZxsoxjzIVblOvhakDAk5hvzYCkKlYDUkLOTRykjEYdHKQEljkWWyRsisgRys9G+zM1zgKjWubllr+SvBkxeWNfbsRzlHbuP/42/a1ipC8wOdVbqtug5EOy7105uNaecUoEjwl9nZ1Kud3bETieO1RvMJdc/adtFHClMUA8LTRFodTs10Nz3Vh7sannU1qInnP2DOI8JHKkwn+FRlrMOwa1AgaRmw349SxPuG0wbmjRqIlo0KZDANia2diZKpIEiC0Lbq3t66qI7YkuN8+Z6rxyvvYIMJW/u8/tSPIqMgdMdrJoYCqyXo91JK/FK0OMlAplrCG/3R6klfrV8v4Wt+WMBBBhMN3mWyIugAK6DHNdDu1wPzDZ8CFqD3sIRxR4HPu9GXA=",
              "body": "{\"event_type\":\"_campaign.send\",\"event_timestamp\":1591996341698,\"arrival_timestamp\":1591996342338,\"event_version\":\"3.1\",\"application\":{\"app_id\":\"xxxx\",\"sdk\":{}},\"client\":{\"client_id\":\"updatemesms3\"},\"device\":{\"platform\":{}},\"session\":{},\"attributes\":{\"campaign_activity_id\":\"e307c199592a41a280a73df802299d81\",\"campaign_send_status\":\"SUCCESS\",\"campaign_type\":null,\"treatment_id\":\"0\",\"campaign_id\":\"bc3727c0ee2c428b876489de58230c52\"},\"client_context\":{\"custom\":{\"endpoint\":\"{\\\"ChannelType\\\":\\\"SMS\\\",\\\"EndpointStatus\\\":\\\"ACTIVE\\\",\\\"OptOut\\\":\\\"NONE\\\",\\\"EffectiveDate\\\":\\\"2020-06-12T20:42:30.309Z\\\",\\\"Attributes\\\":{\\\"Item\\\":[\\\"Taco\\\"],\\\"PricePaid\\\":[\\\"23\\\"]},\\\"User\\\":{\\\"UserId\\\":\\\"User3\\\"}}\",\"message_archive_location\":\"s3://archiver001-messagearchives3bucket-8wgin3ndjsm8/archive/updatemesms3/2020/06/12/21/100548fc-4394-476b-a94f-07bbf7e81219\"}},\"awsAccountId\":\"xxxx\"}",
              "attributes": {
                  "ApproximateReceiveCount": "1",
                  "SentTimestamp": "1592416212754",
                  "SenderId": "AROA6BBJYL7GBNFRX6TWJ:Archiver001-QuererLambda-1J7I5KNW1Z5T5",
                  "ApproximateFirstReceiveTimestamp": "1592416212833"
              },
              "messageAttributes": {},
              "md5OfBody": "f26c094eb2751765b8c80b06430027ab",
              "eventSource": "aws:sqs",
              "eventSourceARN": "arn:aws:sqs:xxx",
              "awsRegion": "xxx"
          }
      ];

      sandbox.stub(PinpointLib.prototype, 'getContentParts').resolves(Promise.resolve([{pieceType: 'TITLE', html: 'html goes here', channel: 'SMS'}]));
      sandbox.stub(RendererLib.prototype, 'render').resolves(Promise.resolve([{pieceType: 'TITLE', html: 'html goes here', channel: 'SMS'}]));
      sandbox.stub(ArchiverLib.prototype, 'archive').resolves(Promise.resolve());

      process(_records, options).then((resp) => {
        expect(resp).to.equal('success');
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('process should error with an invalid record', function(done) {

      const _records = [
          {
              "messageId": "c6578ec3-4044-466d-9596-db37e9224451",
              "receiptHandle": "AQEBLPolk9cvjH07V9au5DGPgfdhWxs7lMx2WhYDWgZxsoxjzIVblOvhakDAk5hvzYCkKlYDUkLOTRykjEYdHKQEljkWWyRsisgRys9G+zM1zgKjWubllr+SvBkxeWNfbsRzlHbuP/42/a1ipC8wOdVbqtug5EOy7105uNaecUoEjwl9nZ1Kud3bETieO1RvMJdc/adtFHClMUA8LTRFodTs10Nz3Vh7sannU1qInnP2DOI8JHKkwn+FRlrMOwa1AgaRmw349SxPuG0wbmjRqIlo0KZDANia2diZKpIEiC0Lbq3t66qI7YkuN8+Z6rxyvvYIMJW/u8/tSPIqMgdMdrJoYCqyXo91JK/FK0OMlAplrCG/3R6klfrV8v4Wt+WMBBBhMN3mWyIugAK6DHNdDu1wPzDZ8CFqD3sIRxR4HPu9GXA=",
              "body": "NOTJSON-SHOULDERROR",
              "attributes": {
                  "ApproximateReceiveCount": "1",
                  "SentTimestamp": "1592416212754",
                  "SenderId": "AROA6BBJYL7GBNFRX6TWJ:Archiver001-QuererLambda-1J7I5KNW1Z5T5",
                  "ApproximateFirstReceiveTimestamp": "1592416212833"
              },
              "messageAttributes": {},
              "md5OfBody": "f26c094eb2751765b8c80b06430027ab",
              "eventSource": "aws:sqs",
              "eventSourceARN": "arn:aws:sqs:xxx",
              "awsRegion": "xxx"
          }
      ];

      sandbox.stub(PinpointLib.prototype, 'getContentParts').resolves(Promise.resolve([{pieceType: 'TITLE', html: 'html goes here', channel: 'SMS'}]));
      sandbox.stub(RendererLib.prototype, 'render').resolves(Promise.resolve([{pieceType: 'TITLE', html: 'html goes here', channel: 'SMS'}]));
      sandbox.stub(ArchiverLib.prototype, 'archive').resolves(Promise.resolve());

      process(_records, options).then((resp) => {
        done('ShouldError');
      }).catch((err) => {
        done();
      });
    });

});
