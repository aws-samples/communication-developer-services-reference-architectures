'use strict';

const sinon = require('sinon');
const assert = require('chai').assert;
const expect = require('chai').expect;
const path = require('path');
const AWS = require('aws-sdk-mock');
AWS.setSDK(path.resolve('./node_modules/aws-sdk'));

const RendererLib = require('./renderer.js');

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

describe('Renderer', function() {

    beforeEach(function() {
        sandbox = sinon.createSandbox();
    });

    afterEach(function() {
        sandbox.restore();
    });


    it('render should return successfully with rendered content', function(done) {
      const _content = [{pieceType: 'TITLE', html: 'html goes here {{User.UserAttributes.FirstName}} {{Attributes.Item}} {{User.UserId}}', channel: 'SMS'}];
      const _endpointId = 'fake_endpoint_id';
      const _endpoint = {"ChannelType":"SMS","EndpointStatus":"ACTIVE","OptOut":"NONE","EffectiveDate":"2020-06-12T20:42:30.309Z","Attributes":{"Item":["Taco"],"PricePaid":["23"]},"User":{"UserId":"User3", "UserAttributes":{"FirstName": ["Tester"]}}};
      const _config = {
        applicationId: 'appId', eventTimestamp: 1591996341698, campaignId: 'campaignId', treatmentId: 'treatmentId', journeyId: 'journeyId', journeyActivityId: 'journeyActivityId', campaignId: undefined, treatmentId: undefined
      };

      const renderer = new RendererLib(options);

      renderer.render(_content, _endpoint, _endpointId, _config).then((resp) => {
        expect(resp.length).to.equal(1);
        expect(resp[0].channel).to.equal('SMS');
        expect(resp[0].pieceType).to.equal('TITLE');
        expect(resp[0].html).to.equal('html goes here Tester Taco User3');
        done();
      }).catch((err) => {
        done(err);
      });
    });


    it('render should return successfully with multipart content', function(done) {
      const _content = [
        {pieceType: 'TITLE', html: 'html goes here {{User.UserAttributes.FirstName}} {{Attributes.Item}} {{User.UserId}}', channel: 'EMAIL'},
        {pieceType: 'HTML', html: '{{User.UserAttributes.FirstName}} {{Attributes.Item}} {{User.UserId}}', channel: 'EMAIL'}
      ];
      const _endpointId = 'fake_endpoint_id';
      const _endpoint = {"ChannelType":"SMS","EndpointStatus":"ACTIVE","OptOut":"NONE","EffectiveDate":"2020-06-12T20:42:30.309Z","Attributes":{"Item":["Taco"],"PricePaid":["23"]},"User":{"UserId":"User3", "UserAttributes":{"FirstName": ["Tester"]}}};
      const _config = {
        applicationId: 'appId', eventTimestamp: 1591996341698, campaignId: 'campaignId', treatmentId: 'treatmentId', journeyId: 'journeyId', journeyActivityId: 'journeyActivityId', campaignId: undefined, treatmentId: undefined
      };

      const renderer = new RendererLib(options);

      renderer.render(_content, _endpoint, _endpointId, _config).then((resp) => {
        expect(resp.length).to.equal(2);
        expect(resp[0].channel).to.equal('EMAIL');
        expect(resp[0].pieceType).to.equal('TITLE');
        expect(resp[0].html).to.equal('html goes here Tester Taco User3');
        expect(resp[1].channel).to.equal('EMAIL');
        expect(resp[1].pieceType).to.equal('HTML');
        expect(resp[1].html).to.equal('Tester Taco User3');
        done();
      }).catch((err) => {
        done(err);
      });
    });


    it('render will render UserAttributes', function(done) {
      const _content = [{pieceType: 'TITLE', html: '{{User.UserAttributes.FirstName}}', channel: 'SMS'}];
      const _endpoint = {"ChannelType":"SMS","EndpointStatus":"ACTIVE","OptOut":"NONE","EffectiveDate":"2020-06-12T20:42:30.309Z","Attributes":{"Item":["Taco"],"PricePaid":["23"]},"User":{"UserId":"User3", "UserAttributes":{"FirstName": ["Tester"]}}};
      const _endpointId = 'fake_endpoint_id';
      const _config = {
        applicationId: 'appId', eventTimestamp: 1591996341698, campaignId: 'campaignId', treatmentId: 'treatmentId', journeyId: 'journeyId', journeyActivityId: 'journeyActivityId', campaignId: undefined, treatmentId: undefined
      };

      const renderer = new RendererLib(options);

      renderer.render(_content, _endpoint, _endpointId, _config).then((resp) => {
        expect(resp.length).to.equal(1);
        expect(resp[0].channel).to.equal('SMS');
        expect(resp[0].pieceType).to.equal('TITLE');
        expect(resp[0].html).to.equal('Tester');
        done();
      }).catch((err) => {
        done(err);
      });
    });


    it('render will render EndpointAttributes', function(done) {
      const _content = [{pieceType: 'TITLE', html: '{{Attributes.Item}}', channel: 'SMS'}];
      const _endpoint = {"ChannelType":"SMS","EndpointStatus":"ACTIVE","OptOut":"NONE","EffectiveDate":"2020-06-12T20:42:30.309Z","Attributes":{"Item":["Taco"],"PricePaid":["23"]},"User":{"UserId":"User3", "UserAttributes":{"FirstName": ["Tester"]}}};
      const _endpointId = 'fake_endpoint_id';
      const _config = {
        applicationId: 'appId', eventTimestamp: 1591996341698, campaignId: 'campaignId', treatmentId: 'treatmentId', journeyId: 'journeyId', journeyActivityId: 'journeyActivityId', campaignId: undefined, treatmentId: undefined
      };

      const renderer = new RendererLib(options);

      renderer.render(_content, _endpoint, _endpointId, _config).then((resp) => {
        expect(resp.length).to.equal(1);
        expect(resp[0].channel).to.equal('SMS');
        expect(resp[0].pieceType).to.equal('TITLE');
        expect(resp[0].html).to.equal('Taco');
        done();
      }).catch((err) => {
        done(err);
      });
    });


    it('render will render EndpointID', function(done) {
      const _content = [{pieceType: 'TITLE', html: '{{Id}}', channel: 'SMS'}];
      const _endpointId = 'fake_endpoint_id';
      const _endpoint = {"ChannelType":"SMS","EndpointStatus":"ACTIVE","OptOut":"NONE","EffectiveDate":"2020-06-12T20:42:30.309Z","Attributes":{"Item":["Taco"],"PricePaid":["23"]},"User":{"UserId":"User3", "UserAttributes":{"FirstName": ["Tester"]}}};
      const _config = {
        applicationId: 'appId', eventTimestamp: 1591996341698, campaignId: 'campaignId', treatmentId: 'treatmentId', journeyId: 'journeyId', journeyActivityId: 'journeyActivityId', campaignId: undefined, treatmentId: undefined
      };

      const renderer = new RendererLib(options);

      renderer.render(_content, _endpoint, _endpointId, _config).then((resp) => {
        expect(resp.length).to.equal(1);
        expect(resp[0].channel).to.equal('SMS');
        expect(resp[0].pieceType).to.equal('TITLE');
        expect(resp[0].html).to.equal('fake_endpoint_id');
        done();
      }).catch((err) => {
        done(err);
      });
    });


    it('render will mask out Address', function(done) {
      const _content = [{pieceType: 'TITLE', html: '{{Address}}', channel: 'SMS'}];
      const _endpointId = 'fake_endpoint_id';
      const _endpoint = {"ChannelType":"SMS","EndpointStatus":"ACTIVE","OptOut":"NONE","EffectiveDate":"2020-06-12T20:42:30.309Z","Attributes":{"Item":["Taco"],"PricePaid":["23"]},"User":{"UserId":"User3", "UserAttributes":{"FirstName": ["Tester"]}}};
      const _config = {
        applicationId: 'appId', eventTimestamp: 1591996341698, campaignId: 'campaignId', treatmentId: 'treatmentId', journeyId: 'journeyId', journeyActivityId: 'journeyActivityId', campaignId: undefined, treatmentId: undefined
      };

      const renderer = new RendererLib(options);

      renderer.render(_content, _endpoint, _endpointId, _config).then((resp) => {
        expect(resp.length).to.equal(1);
        expect(resp[0].channel).to.equal('SMS');
        expect(resp[0].pieceType).to.equal('TITLE');
        expect(resp[0].html).to.equal('XXXXXXXX');
        done();
      }).catch((err) => {
        done(err);
      });
    });


});
