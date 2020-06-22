'use strict';

const sinon = require('sinon');
const assert = require('chai').assert;
const expect = require('chai').expect;
const path = require('path');
const mimemessage = require('mimemessage');
const AWS = require('aws-sdk-mock');
AWS.setSDK(path.resolve('./node_modules/aws-sdk'));

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

describe('Archiver', function() {

    beforeEach(function() {
        sandbox = sinon.createSandbox();
        AWS.mock('S3', 'putObject', (params, callback) => { callback(null, 'success'); });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('archive should return successfully with rendered content', function(done) {

      const _rendered = [{pieceType: 'TITLE', html: 'html goes here', channel: 'SMS'}];
      const _endpointId = 'fake_endpoint_id';
      const _config = {
        applicationId: 'appId', eventTimestamp: 1591996341698, campaignId: 'campaignId', treatmentId: 'treatmentId', journeyId: 'journeyId', journeyActivityId: 'journeyActivityId'
      };
      const _messageArchiveLocation = 's3://fake_bucket/path/to/location/random_file_name';

      const archiver = new ArchiverLib(options);

      archiver.archive(_rendered, _endpointId, _config, _messageArchiveLocation).then((resp) => {
        expect(resp).to.equal('success');
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('archive should return successfully with no content', function(done) {

      const _rendered = [];
      const _endpointId = 'fake_endpoint_id';
      const _config = {
        applicationId: 'appId', eventTimestamp: 1591996341698, campaignId: 'campaignId', treatmentId: 'treatmentId', journeyId: 'journeyId', journeyActivityId: 'journeyActivityId'
      };
      const _messageArchiveLocation = 's3://fake_bucket/path/to/location/random_file_name';

      const archiver = new ArchiverLib(options);

      archiver.archive(_rendered, _endpointId, _config, _messageArchiveLocation).then((resp) => {
        expect(resp).to.equal('success');
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('generateMimeBody should archive an SMS rendering', function(done) {

      const _rendered = [{pieceType: 'TITLE', html: 'html goes here', channel: 'SMS'}];
      const _endpointId = 'fake_endpoint_id';
      const _config = {
        applicationId: 'appId', eventTimestamp: 1591996341698, campaignId: 'campaignId', treatmentId: 'treatmentId'
      };

      const archiver = new ArchiverLib(options);

      try {
        const resp = archiver.generateMimeBody(_rendered, _endpointId, _config);
        console.log(resp);
        expect(resp).to.be.a('string');

        const msg = mimemessage.parse(resp);
        expect(msg).to.not.equal(false);
    		expect(msg.isMultiPart()).to.equal(true);
    		expect(msg.contentType().type).to.equal('multipart');
    		expect(msg.contentType().subtype).to.equal('mixed');
    		expect(msg.contentType().fulltype).to.equal('multipart/mixed');
        expect(msg.header('EndpointId')).to.equal('fake_endpoint_id');
        expect(msg.header('ApplicationId')).to.equal('appId');
        expect(msg.header('EventTimestamp')).to.equal('1591996341698');
        expect(msg.header('CampaignId')).to.equal('campaignId');
        expect(msg.header('TreatmentId')).to.equal('treatmentId');
        expect(msg.header('JourneyId')).to.equal(undefined);
        expect(msg.header('JourneyActivityId')).to.equal(undefined);
        expect(msg.header('Channel')).to.equal('SMS');

        expect(msg.body[0].body).to.equal('html goes here');
        expect(msg.body[0].header('Content-Piece-Type')).to.equal('TITLE');

        done();
      } catch (err) {
        done(err);
      };
    });

    it('generateMimeBody should archive an Email rendering', function(done) {

      const _rendered = [
        {pieceType: 'TITLE', html: 'Subject goes here', channel: 'EMAIL'},
        {pieceType: 'HTML', html: '<p>HTML Body Goes here</p>', channel: 'EMAIL'},
        {pieceType: 'TEXT', html: 'Text Body', channel: 'EMAIL'},
      ];
      const _endpointId = 'fake_endpoint_id';
      const _config = {
        applicationId: 'appId', eventTimestamp: 1591996341698, journeyId: 'journeyId', journeyActivityId: 'journeyActivityId'
      };

      const archiver = new ArchiverLib(options);

      try {
        const resp = archiver.generateMimeBody(_rendered, _endpointId, _config);
        console.log(resp);
        expect(resp).to.be.a('string');

        const msg = mimemessage.parse(resp);
        expect(msg).to.not.equal(false);
    		expect(msg.isMultiPart()).to.equal(true);
    		expect(msg.contentType().type).to.equal('multipart');
    		expect(msg.contentType().subtype).to.equal('mixed');
    		expect(msg.contentType().fulltype).to.equal('multipart/mixed');
        expect(msg.header('EndpointId')).to.equal('fake_endpoint_id');
        expect(msg.header('ApplicationId')).to.equal('appId');
        expect(msg.header('EventTimestamp')).to.equal('1591996341698');
        expect(msg.header('CampaignId')).to.equal(undefined);
        expect(msg.header('TreatmentId')).to.equal(undefined);
        expect(msg.header('JourneyId')).to.equal('journeyId');
        expect(msg.header('JourneyActivityId')).to.equal('journeyActivityId');
        expect(msg.header('Channel')).to.equal('EMAIL');

        expect(msg.body[0].body).to.equal('Subject goes here');
        expect(msg.body[0].header('Content-Piece-Type')).to.equal('TITLE');
        expect(msg.body[1].body).to.equal('<p>HTML Body Goes here</p>');
        expect(msg.body[1].header('Content-Piece-Type')).to.equal('HTML');
        expect(msg.body[2].body).to.equal('Text Body');
        expect(msg.body[2].header('Content-Piece-Type')).to.equal('TEXT');

        done();
      } catch (err) {
        done(err);
      };
    });

});
