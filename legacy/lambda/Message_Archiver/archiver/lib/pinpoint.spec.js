'use strict';

const sinon = require('sinon');
const assert = require('chai').assert;
const expect = require('chai').expect;
const path = require('path');
const AWS = require('aws-sdk-mock');
AWS.setSDK(path.resolve('./node_modules/aws-sdk'));

const PinpointLib = require('./pinpoint.js');

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

describe('Pinpoint', function() {

    beforeEach(function() {
        sandbox = sinon.createSandbox();
    });

    afterEach(function() {
      sandbox.restore();
    });


    it('getContentParts should return successfully for Journeys', function(done) {

      const _options = {
        applicationId: 'fake_application_id', eventTimestamp: 1591996341698, campaignId: undefined, treatmentId: undefined, journeyId: 'journeyId', journeyActivityId: 'lmtZdYWNYR', campaignId: undefined, treatmentId: undefined
      };

      AWS.mock('Pinpoint', 'getJourney', {JourneyResponse: _journeyResponse});
      AWS.mock('Pinpoint', 'getEmailTemplate', {EmailTemplateResponse: _emailTemplateResponse});

      const pinpoint = new PinpointLib(options);

      pinpoint.getContentParts(_options).then((resp) => {
        expect(resp.length).to.equal(3);
        expect(resp[0].channel).to.equal('EMAIL');
        expect(resp[1].channel).to.equal('EMAIL');
        expect(resp[2].channel).to.equal('EMAIL');

        resp.sort((a,b) => a.pieceType < b.pieceType ? -1 : 1);
        expect(resp[0].html).to.equal("<!DOCTYPE html>\n    <html lang=\"en\">\n    <head>\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n</head>\n<body>\nGreat Job!  Purchase Status {{Attributes.Purchase}}\n</body>\n</html>");
        expect(resp[1].html).to.equal("Plain text here");
        expect(resp[2].html).to.equal("Thank you for making a purchase!");

        expect(resp[0].defaultSubs).to.equal(undefined);
        expect(resp[1].defaultSubs).to.equal(undefined);
        expect(resp[2].defaultSubs).to.equal(undefined);

        AWS.restore('Pinpoint', 'getJourney');
        AWS.restore('Pinpoint', 'getEmailTemplate');

        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('getContentParts should return successfully for Journeys and DefaultSubstitutions', function(done) {
      const _options = {
        applicationId: 'fake_application_id', eventTimestamp: 1591996341698, campaignId: undefined, treatmentId: undefined, journeyId: 'journeyId', journeyActivityId: 'lmtZdYWNYR', campaignId: undefined, treatmentId: undefined
      };

      AWS.mock('Pinpoint', 'getJourney', {JourneyResponse: _journeyResponseWithDefaultSubstitutions});
      AWS.mock('Pinpoint', 'getEmailTemplate', {EmailTemplateResponse: _emailTemplateResponseWithDefaultSubstitutions});

      const pinpoint = new PinpointLib(options);

      pinpoint.getContentParts(_options).then((resp) => {

        console.log(resp);

        expect(resp.length).to.equal(3);
        expect(resp[0].channel).to.equal('EMAIL');
        expect(resp[1].channel).to.equal('EMAIL');
        expect(resp[2].channel).to.equal('EMAIL');

        resp.sort((a,b) => a.pieceType < b.pieceType ? -1 : 1);
        expect(resp[0].html).to.equal("<!DOCTYPE html>\n    <html lang=\"en\">\n    <head>\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n</head>\n<body>\nGreat Job!  Purchase Status {{Attributes.Purchase}}\n</body>\n</html>");
        expect(resp[1].html).to.equal("Plain text here");
        expect(resp[2].html).to.equal("Thank you for making a purchase!");

        expect(resp[0].defaultSubs).to.equal('{"Attributes":{"Purchase":"Test"}}');
        expect(resp[1].defaultSubs).to.equal('{"Attributes":{"Purchase":"Test"}}');
        expect(resp[2].defaultSubs).to.equal('{"Attributes":{"Purchase":"Test"}}');

        AWS.restore('Pinpoint', 'getJourney');
        AWS.restore('Pinpoint', 'getEmailTemplate');

        done();
      }).catch((err) => {
        done(err);
      });
    });

});


const _journeyResponse = {
  "Activities": {
      "DZaQ0CESSG": {},
      "WxOKnCmKpT": {},
      "lmtZdYWNYR": {
          "EMAIL": {
              "NextActivity": "8EyBzMMeDa",
              "TemplateName": "Email_Template_name"
          }
      },
      "8EyBzMMeDa": {}
  },
  "ApplicationId": "fake_application_id",
  "CreationDate": "2020-05-28T23:27:09.860Z",
  "Id": "fcd3044b0f12446eb62b61892f8c0c3a",
  "LastModifiedDate": "2020-06-10T18:26:09.021Z",
  "LocalTime": false,
  "Name": "Journey Name",
  "Schedule": {
      "Timezone": "UTC-07"
  },
  "StartActivity": "DZaQ0CESSG",
  "State": "DRAFT"
};

const _journeyResponseWithDefaultSubstitutions = {
  "Activities": {
      "DZaQ0CESSG": {},
      "WxOKnCmKpT": {},
      "lmtZdYWNYR": {
          "EMAIL": {
              "NextActivity": "8EyBzMMeDa",
              "TemplateName": "Email_Template_name_with_default"
          }
      },
      "8EyBzMMeDa": {}
  },
  "ApplicationId": "fake_application_id",
  "CreationDate": "2020-05-28T23:27:09.860Z",
  "Id": "fcd3044b0f12446eb62b61892f8c0c3a",
  "LastModifiedDate": "2020-06-10T18:26:09.021Z",
  "LocalTime": false,
  "Name": "Journey Name",
  "Schedule": {
      "Timezone": "UTC-07"
  },
  "StartActivity": "DZaQ0CESSG",
  "State": "DRAFT"
};


const _emailTemplateResponse = {
  "Arn": "arn:aws:mobiletargeting:xxx",
  "CreationDate": "2019-11-22T15:49:02.572Z",
  "HtmlPart": "<!DOCTYPE html>\n    <html lang=\"en\">\n    <head>\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n</head>\n<body>\nGreat Job!  Purchase Status {{Attributes.Purchase}}\n</body>\n</html>",
  "LastModifiedDate": "2019-11-22T15:49:02.572Z",
  "Subject": "Thank you for making a purchase!",
  "tags": {},
  "TemplateName": "ThanksForPurchasing",
  "TemplateType": "EMAIL",
  "TextPart": "Plain text here",
  "Version": "1"
};

const _emailTemplateResponseWithDefaultSubstitutions = {
  "Arn": "arn:aws:mobiletargeting:xxx",
  "CreationDate": "2019-11-22T15:49:02.572Z",
  "DefaultSubstitutions": "{\"Attributes\":{\"Purchase\":\"Test\"}}",
  "HtmlPart": "<!DOCTYPE html>\n    <html lang=\"en\">\n    <head>\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n</head>\n<body>\nGreat Job!  Purchase Status {{Attributes.Purchase}}\n</body>\n</html>",
  "LastModifiedDate": "2019-11-22T15:49:02.572Z",
  "Subject": "Thank you for making a purchase!",
  "tags": {},
  "TemplateName": "ThanksForPurchasing",
  "TemplateType": "EMAIL",
  "TextPart": "Plain text here",
  "Version": "1"
};
