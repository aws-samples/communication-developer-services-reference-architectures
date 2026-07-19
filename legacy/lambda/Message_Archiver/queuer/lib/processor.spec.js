'use strict';

const sinon = require('sinon');
const assert = require('chai').assert;
const expect = require('chai').expect;
const path = require('path');
const AWS = require('aws-sdk-mock');
AWS.setSDK(path.resolve('./node_modules/aws-sdk'));

const Processor = require('./processor.js');
const Queuer = require('./queuer.js');

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

describe('Processor', function() {

    beforeEach(function() {
        sandbox = sinon.createSandbox();
        sandbox.stub(Queuer.prototype, 'sendEventForAchiving').resolves(Promise.resolve());
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('processRecords should return mutated events', function(done) {

      const _records = [
        {
          "recordId": "49607899387440210186580631207602122343817916558121893890000000",
          "approximateArrivalTimestamp": 1591996344859,
          "data": "eyJldmVudF90eXBlIjoiX2NhbXBhaWduLnNlbmQiLCJldmVudF90aW1lc3RhbXAiOjE1OTE5OTYzNDE2OTcsImFycml2YWxfdGltZXN0YW1wIjoxNTkxOTk2MzQyMzM3LCJldmVudF92ZXJzaW9uIjoiMy4xIiwiYXBwbGljYXRpb24iOnsiYXBwX2lkIjoieHh4eCIsInNkayI6e319LCJjbGllbnQiOnsiY2xpZW50X2lkIjoidXBkYXRlbWVzbXMyIn0sImRldmljZSI6eyJwbGF0Zm9ybSI6e319LCJzZXNzaW9uIjp7fSwiYXR0cmlidXRlcyI6eyJjYW1wYWlnbl9hY3Rpdml0eV9pZCI6ImUzMDdjMTk5NTkyYTQxYTI4MGE3M2RmODAyMjk5ZDgxIiwiY2FtcGFpZ25fc2VuZF9zdGF0dXMiOiJTVUNDRVNTIiwiY2FtcGFpZ25fdHlwZSI6bnVsbCwidHJlYXRtZW50X2lkIjoiMCIsImNhbXBhaWduX2lkIjoiYmMzNzI3YzBlZTJjNDI4Yjg3NjQ4OWRlNTgyMzBjNTIifSwiY2xpZW50X2NvbnRleHQiOnsiY3VzdG9tIjp7ImVuZHBvaW50Ijoie1wiQ2hhbm5lbFR5cGVcIjpcIlNNU1wiLFwiRW5kcG9pbnRTdGF0dXNcIjpcIkFDVElWRVwiLFwiT3B0T3V0XCI6XCJOT05FXCIsXCJFZmZlY3RpdmVEYXRlXCI6XCIyMDIwLTA2LTEyVDIwOjQyOjMwLjMwOVpcIixcIkF0dHJpYnV0ZXNcIjp7XCJJdGVtXCI6W1wiUGxhbnRcIl0sXCJQcmljZVBhaWRcIjpbXCIzNFwiXX0sXCJVc2VyXCI6e1wiVXNlcklkXCI6XCJVc2VyMlwifX0ifX0sImF3c0FjY291bnRJZCI6Inh4eHgifQo="
        },
        {
          "recordId": "49607899387440210186580631207603331269637531187296600066000000",
          "approximateArrivalTimestamp": 1591996344862,
          "data": "eyJldmVudF90eXBlIjoiX2NhbXBhaWduLnNlbmQiLCJldmVudF90aW1lc3RhbXAiOjE1OTE5OTYzNDE2OTgsImFycml2YWxfdGltZXN0YW1wIjoxNTkxOTk2MzQyMzM4LCJldmVudF92ZXJzaW9uIjoiMy4xIiwiYXBwbGljYXRpb24iOnsiYXBwX2lkIjoieHh4eCIsInNkayI6e319LCJjbGllbnQiOnsiY2xpZW50X2lkIjoidXBkYXRlbWVzbXMzIn0sImRldmljZSI6eyJwbGF0Zm9ybSI6e319LCJzZXNzaW9uIjp7fSwiYXR0cmlidXRlcyI6eyJjYW1wYWlnbl9hY3Rpdml0eV9pZCI6ImUzMDdjMTk5NTkyYTQxYTI4MGE3M2RmODAyMjk5ZDgxIiwiY2FtcGFpZ25fc2VuZF9zdGF0dXMiOiJTVUNDRVNTIiwiY2FtcGFpZ25fdHlwZSI6bnVsbCwidHJlYXRtZW50X2lkIjoiMCIsImNhbXBhaWduX2lkIjoiYmMzNzI3YzBlZTJjNDI4Yjg3NjQ4OWRlNTgyMzBjNTIifSwiY2xpZW50X2NvbnRleHQiOnsiY3VzdG9tIjp7ImVuZHBvaW50Ijoie1wiQ2hhbm5lbFR5cGVcIjpcIlNNU1wiLFwiRW5kcG9pbnRTdGF0dXNcIjpcIkFDVElWRVwiLFwiT3B0T3V0XCI6XCJOT05FXCIsXCJFZmZlY3RpdmVEYXRlXCI6XCIyMDIwLTA2LTEyVDIwOjQyOjMwLjMwOVpcIixcIkF0dHJpYnV0ZXNcIjp7XCJJdGVtXCI6W1wiVGFjb1wiXSxcIlByaWNlUGFpZFwiOltcIjIzXCJdfSxcIlVzZXJcIjp7XCJVc2VySWRcIjpcIlVzZXIzXCJ9fSJ9fSwiYXdzQWNjb3VudElkIjoieHh4eCJ9Cg=="
        },
        {
          "recordId": "49607899387440210186580631207604540195457145953910259714000000",
          "approximateArrivalTimestamp": 1591996347027,
          "data": "eyJldmVudF90eXBlIjoiX1NNUy5CVUZGRVJFRCIsImV2ZW50X3RpbWVzdGFtcCI6MTU5MTk5NjM0MjA3OCwiYXJyaXZhbF90aW1lc3RhbXAiOjE1OTE5OTYzNDE3MTksImV2ZW50X3ZlcnNpb24iOiIzLjEiLCJhcHBsaWNhdGlvbiI6eyJhcHBfaWQiOiJ4eHh4Iiwic2RrIjp7fX0sImNsaWVudCI6eyJjbGllbnRfaWQiOiJ1cGRhdGVtZXNtczIifSwiZGV2aWNlIjp7InBsYXRmb3JtIjp7fX0sInNlc3Npb24iOnt9LCJhdHRyaWJ1dGVzIjp7InNlbmRlcl9yZXF1ZXN0X2lkIjoiOWRiZWY5YmMtYjgyZS00MzIwLWEzNjUteHh4IiwiY2FtcGFpZ25fYWN0aXZpdHlfaWQiOiJlMzA3YzE5OTU5MmE0MWEyODBhNzNkZjgwMjI5OWQ4MSIsImRlc3RpbmF0aW9uX3Bob25lX251bWJlciI6IisxeHh4eCIsInJlY29yZF9zdGF0dXMiOiJTVUNDRVNTRlVMIiwiaXNvX2NvdW50cnlfY29kZSI6IlVTIiwidHJlYXRtZW50X2lkIjoiMCIsIm51bWJlcl9vZl9tZXNzYWdlX3BhcnRzIjoiMSIsIm1lc3NhZ2VfaWQiOiJ4eHh4IiwibWVzc2FnZV90eXBlIjoiVHJhbnNhY3Rpb25hbCIsImNhbXBhaWduX2lkIjoiYmMzNzI3YzBlZTJjNDI4Yjg3NjQ4OWRlNTgyMzBjNTIiLCJjdXN0b21lcl9jb250ZXh0Ijoie1widXNlcklkXCI6XCJVc2VyMlwifSJ9LCJtZXRyaWNzIjp7InByaWNlX2luX21pbGxpY2VudHNfdXNkIjo2NDUuMH0sImF3c0FjY291bnRJZCI6Inh4eHgifQo="
        },
        {
          "recordId": "49607899387440210186580631207605749121276760583084965890000000",
          "approximateArrivalTimestamp": 1591996347030,
          "data": "eyJldmVudF90eXBlIjoiX1NNUy5CVUZGRVJFRCIsImV2ZW50X3RpbWVzdGFtcCI6MTU5MTk5NjM0MjMwMSwiYXJyaXZhbF90aW1lc3RhbXAiOjE1OTE5OTYzNDE3NDcsImV2ZW50X3ZlcnNpb24iOiIzLjEiLCJhcHBsaWNhdGlvbiI6eyJhcHBfaWQiOiJ4eHh4Iiwic2RrIjp7fX0sImNsaWVudCI6eyJjbGllbnRfaWQiOiJ1cGRhdGVtZXNtczMifSwiZGV2aWNlIjp7InBsYXRmb3JtIjp7fX0sInNlc3Npb24iOnt9LCJhdHRyaWJ1dGVzIjp7InNlbmRlcl9yZXF1ZXN0X2lkIjoiOGY4MDg1ZDMtMTVkZC00MjJjLTliNTMteHh4eHgiLCJjYW1wYWlnbl9hY3Rpdml0eV9pZCI6ImUzMDdjMTk5NTkyYTQxYTI4MGE3M2RmODAyMjk5ZDgxIiwiZGVzdGluYXRpb25fcGhvbmVfbnVtYmVyIjoiKzF4eHh4IiwicmVjb3JkX3N0YXR1cyI6IlNVQ0NFU1NGVUwiLCJpc29fY291bnRyeV9jb2RlIjoiVVMiLCJ0cmVhdG1lbnRfaWQiOiIwIiwibnVtYmVyX29mX21lc3NhZ2VfcGFydHMiOiIxIiwibWVzc2FnZV9pZCI6Inh4eHgiLCJtZXNzYWdlX3R5cGUiOiJUcmFuc2FjdGlvbmFsIiwiY2FtcGFpZ25faWQiOiJiYzM3MjdjMGVlMmM0MjhiODc2NDg5ZGU1ODIzMGM1MiIsImN1c3RvbWVyX2NvbnRleHQiOiJ7XCJ1c2VySWRcIjpcIlVzZXIzXCJ9In0sIm1ldHJpY3MiOnsicHJpY2VfaW5fbWlsbGljZW50c191c2QiOjY0NS4wfSwiYXdzQWNjb3VudElkIjoieHh4eCJ9Cg=="
        }
      ];

      let _resp = [
        {
          "data": "eyJldmVudF90eXBlIjoiX2NhbXBhaWduLnNlbmQiLCJldmVudF90aW1lc3RhbXAiOjE1OTE5OTYzNDE2OTcsImFycml2YWxfdGltZXN0YW1wIjoxNTkxOTk2MzQyMzM3LCJldmVudF92ZXJzaW9uIjoiMy4xIiwiYXBwbGljYXRpb24iOnsiYXBwX2lkIjoieHh4eCIsInNkayI6e319LCJjbGllbnQiOnsiY2xpZW50X2lkIjoidXBkYXRlbWVzbXMyIn0sImRldmljZSI6eyJwbGF0Zm9ybSI6e319LCJzZXNzaW9uIjp7fSwiYXR0cmlidXRlcyI6eyJjYW1wYWlnbl9hY3Rpdml0eV9pZCI6ImUzMDdjMTk5NTkyYTQxYTI4MGE3M2RmODAyMjk5ZDgxIiwiY2FtcGFpZ25fc2VuZF9zdGF0dXMiOiJTVUNDRVNTIiwiY2FtcGFpZ25fdHlwZSI6bnVsbCwidHJlYXRtZW50X2lkIjoiMCIsImNhbXBhaWduX2lkIjoiYmMzNzI3YzBlZTJjNDI4Yjg3NjQ4OWRlNTgyMzBjNTIifSwiY2xpZW50X2NvbnRleHQiOnsiY3VzdG9tIjp7ImVuZHBvaW50Ijoie1wiQ2hhbm5lbFR5cGVcIjpcIlNNU1wiLFwiRW5kcG9pbnRTdGF0dXNcIjpcIkFDVElWRVwiLFwiT3B0T3V0XCI6XCJOT05FXCIsXCJFZmZlY3RpdmVEYXRlXCI6XCIyMDIwLTA2LTEyVDIwOjQyOjMwLjMwOVpcIixcIkF0dHJpYnV0ZXNcIjp7XCJJdGVtXCI6W1wiUGxhbnRcIl0sXCJQcmljZVBhaWRcIjpbXCIzNFwiXX0sXCJVc2VyXCI6e1wiVXNlcklkXCI6XCJVc2VyMlwifX0iLCJtZXNzYWdlX2FyY2hpdmVfbG9jYXRpb24iOiJzMzovL2FyY2hpdmVyMDAxLW1lc3NhZ2VhcmNoaXZlczNidWNrZXQtOHdnaW4zbmRqc204L2FyY2hpdmUvdXBkYXRlbWVzbXMyLzIwMjAvMDYvMTIvMjEvYjEwNWYzYjItOGI4MS00YjdhLWE0N2MtN2U1YzcyYzVkNWEyIn19LCJhd3NBY2NvdW50SWQiOiJ4eHh4In0=",
          "recordId": "49607899387440210186580631207602122343817916558121893890000000",
          "result": "Ok"
        },
        {
          "data": "eyJldmVudF90eXBlIjoiX2NhbXBhaWduLnNlbmQiLCJldmVudF90aW1lc3RhbXAiOjE1OTE5OTYzNDE2OTgsImFycml2YWxfdGltZXN0YW1wIjoxNTkxOTk2MzQyMzM4LCJldmVudF92ZXJzaW9uIjoiMy4xIiwiYXBwbGljYXRpb24iOnsiYXBwX2lkIjoieHh4eCIsInNkayI6e319LCJjbGllbnQiOnsiY2xpZW50X2lkIjoidXBkYXRlbWVzbXMzIn0sImRldmljZSI6eyJwbGF0Zm9ybSI6e319LCJzZXNzaW9uIjp7fSwiYXR0cmlidXRlcyI6eyJjYW1wYWlnbl9hY3Rpdml0eV9pZCI6ImUzMDdjMTk5NTkyYTQxYTI4MGE3M2RmODAyMjk5ZDgxIiwiY2FtcGFpZ25fc2VuZF9zdGF0dXMiOiJTVUNDRVNTIiwiY2FtcGFpZ25fdHlwZSI6bnVsbCwidHJlYXRtZW50X2lkIjoiMCIsImNhbXBhaWduX2lkIjoiYmMzNzI3YzBlZTJjNDI4Yjg3NjQ4OWRlNTgyMzBjNTIifSwiY2xpZW50X2NvbnRleHQiOnsiY3VzdG9tIjp7ImVuZHBvaW50Ijoie1wiQ2hhbm5lbFR5cGVcIjpcIlNNU1wiLFwiRW5kcG9pbnRTdGF0dXNcIjpcIkFDVElWRVwiLFwiT3B0T3V0XCI6XCJOT05FXCIsXCJFZmZlY3RpdmVEYXRlXCI6XCIyMDIwLTA2LTEyVDIwOjQyOjMwLjMwOVpcIixcIkF0dHJpYnV0ZXNcIjp7XCJJdGVtXCI6W1wiVGFjb1wiXSxcIlByaWNlUGFpZFwiOltcIjIzXCJdfSxcIlVzZXJcIjp7XCJVc2VySWRcIjpcIlVzZXIzXCJ9fSIsIm1lc3NhZ2VfYXJjaGl2ZV9sb2NhdGlvbiI6InMzOi8vYXJjaGl2ZXIwMDEtbWVzc2FnZWFyY2hpdmVzM2J1Y2tldC04d2dpbjNuZGpzbTgvYXJjaGl2ZS91cGRhdGVtZXNtczMvMjAyMC8wNi8xMi8yMS8zOThlMWU2Ni0zYjM2LTQzOTItOTk2NS0wYTg3MGU5ZWY2OTUifX0sImF3c0FjY291bnRJZCI6Inh4eHgifQ==",
          "recordId": "49607899387440210186580631207603331269637531187296600066000000",
          "result": "Ok"
        },
        {
          "data": "eyJldmVudF90eXBlIjoiX1NNUy5CVUZGRVJFRCIsImV2ZW50X3RpbWVzdGFtcCI6MTU5MTk5NjM0MjA3OCwiYXJyaXZhbF90aW1lc3RhbXAiOjE1OTE5OTYzNDE3MTksImV2ZW50X3ZlcnNpb24iOiIzLjEiLCJhcHBsaWNhdGlvbiI6eyJhcHBfaWQiOiJ4eHh4Iiwic2RrIjp7fX0sImNsaWVudCI6eyJjbGllbnRfaWQiOiJ1cGRhdGVtZXNtczIifSwiZGV2aWNlIjp7InBsYXRmb3JtIjp7fX0sInNlc3Npb24iOnt9LCJhdHRyaWJ1dGVzIjp7InNlbmRlcl9yZXF1ZXN0X2lkIjoiOWRiZWY5YmMtYjgyZS00MzIwLWEzNjUteHh4IiwiY2FtcGFpZ25fYWN0aXZpdHlfaWQiOiJlMzA3YzE5OTU5MmE0MWEyODBhNzNkZjgwMjI5OWQ4MSIsImRlc3RpbmF0aW9uX3Bob25lX251bWJlciI6IisxeHh4eCIsInJlY29yZF9zdGF0dXMiOiJTVUNDRVNTRlVMIiwiaXNvX2NvdW50cnlfY29kZSI6IlVTIiwidHJlYXRtZW50X2lkIjoiMCIsIm51bWJlcl9vZl9tZXNzYWdlX3BhcnRzIjoiMSIsIm1lc3NhZ2VfaWQiOiJ4eHh4IiwibWVzc2FnZV90eXBlIjoiVHJhbnNhY3Rpb25hbCIsImNhbXBhaWduX2lkIjoiYmMzNzI3YzBlZTJjNDI4Yjg3NjQ4OWRlNTgyMzBjNTIiLCJjdXN0b21lcl9jb250ZXh0Ijoie1widXNlcklkXCI6XCJVc2VyMlwifSJ9LCJtZXRyaWNzIjp7InByaWNlX2luX21pbGxpY2VudHNfdXNkIjo2NDUuMH0sImF3c0FjY291bnRJZCI6Inh4eHgifQo=",
          "recordId": "49607899387440210186580631207604540195457145953910259714000000",
          "result": "Ok"
        },
        {
          "data": "eyJldmVudF90eXBlIjoiX1NNUy5CVUZGRVJFRCIsImV2ZW50X3RpbWVzdGFtcCI6MTU5MTk5NjM0MjMwMSwiYXJyaXZhbF90aW1lc3RhbXAiOjE1OTE5OTYzNDE3NDcsImV2ZW50X3ZlcnNpb24iOiIzLjEiLCJhcHBsaWNhdGlvbiI6eyJhcHBfaWQiOiJ4eHh4Iiwic2RrIjp7fX0sImNsaWVudCI6eyJjbGllbnRfaWQiOiJ1cGRhdGVtZXNtczMifSwiZGV2aWNlIjp7InBsYXRmb3JtIjp7fX0sInNlc3Npb24iOnt9LCJhdHRyaWJ1dGVzIjp7InNlbmRlcl9yZXF1ZXN0X2lkIjoiOGY4MDg1ZDMtMTVkZC00MjJjLTliNTMteHh4eHgiLCJjYW1wYWlnbl9hY3Rpdml0eV9pZCI6ImUzMDdjMTk5NTkyYTQxYTI4MGE3M2RmODAyMjk5ZDgxIiwiZGVzdGluYXRpb25fcGhvbmVfbnVtYmVyIjoiKzF4eHh4IiwicmVjb3JkX3N0YXR1cyI6IlNVQ0NFU1NGVUwiLCJpc29fY291bnRyeV9jb2RlIjoiVVMiLCJ0cmVhdG1lbnRfaWQiOiIwIiwibnVtYmVyX29mX21lc3NhZ2VfcGFydHMiOiIxIiwibWVzc2FnZV9pZCI6Inh4eHgiLCJtZXNzYWdlX3R5cGUiOiJUcmFuc2FjdGlvbmFsIiwiY2FtcGFpZ25faWQiOiJiYzM3MjdjMGVlMmM0MjhiODc2NDg5ZGU1ODIzMGM1MiIsImN1c3RvbWVyX2NvbnRleHQiOiJ7XCJ1c2VySWRcIjpcIlVzZXIzXCJ9In0sIm1ldHJpY3MiOnsicHJpY2VfaW5fbWlsbGljZW50c191c2QiOjY0NS4wfSwiYXdzQWNjb3VudElkIjoieHh4eCJ9Cg==",
          "recordId": "49607899387440210186580631207605749121276760583084965890000000",
          "result": "Ok"
        }
      ];

      const processor = new Processor(options);

      processor.processRecords(_records, options).then((resp) => {
        // Check we have the same number of records coming out as going in
        expect(resp).to.have.lengthOf(_records.length);
        for (var i = 0; i < resp.length; i++) {
          // Check that all are marked as "Ok" for Firehose to continue processing
          expect(resp[i].result).to.equal('Ok');
        }
        // Check that first two base64 strings are mutated
        expect(resp[0].data).to.not.equal(_records[0].data);
        expect(resp[1].data).to.not.equal(_records[1].data);

        // Check that first two base64 strings are same
        expect(resp[2].data).to.equal(_records[2].data);
        expect(resp[3].data).to.equal(_records[3].data);
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it ('journeyCampaignEvent should return object with message_archive_location', function(done) {
      const _event = {"event_type":"_campaign.send","event_timestamp":1591996341698,"arrival_timestamp":1591996342338,"event_version":"3.1","application":{"app_id":"xxxx","sdk":{}},"client":{"client_id":"updatemesms3"},"device":{"platform":{}},"session":{},"attributes":{"campaign_activity_id":"e307c199592a41a280a73df802299d81","campaign_send_status":"SUCCESS","campaign_type":null,"treatment_id":"0","campaign_id":"bc3727c0ee2c428b876489de58230c52"},"client_context":{"custom":{"endpoint":"{\"ChannelType\":\"SMS\",\"EndpointStatus\":\"ACTIVE\",\"OptOut\":\"NONE\",\"EffectiveDate\":\"2020-06-12T20:42:30.309Z\",\"Attributes\":{\"Item\":[\"Taco\"],\"PricePaid\":[\"23\"]},\"User\":{\"UserId\":\"User3\"}}"}},"awsAccountId":"xxxx"};

      const processor = new Processor(options);

      processor.journeyCampaignEvent(_event).then((resp) => {
        expect(resp).to.be.a('string');
        const decoded = JSON.parse(Buffer.from(resp, 'base64').toString('ascii'));
        expect(decoded.client_context.custom.message_archive_location).to.be.a('string');

        done();
      }).catch((err) => {
        done(err);
      });
    });

    it ('defaultEvent should return object unmutated', function(done) {
      const _record = {
        "recordId": "49607899387440210186580631207605749121276760583084965890000000",
        "approximateArrivalTimestamp": 1591996347030,
        "data": "eyJldmVudF90eXBlIjoiX1NNUy5CVUZGRVJFRCIsImV2ZW50X3RpbWVzdGFtcCI6MTU5MTk5NjM0MjMwMSwiYXJyaXZhbF90aW1lc3RhbXAiOjE1OTE5OTYzNDE3NDcsImV2ZW50X3ZlcnNpb24iOiIzLjEiLCJhcHBsaWNhdGlvbiI6eyJhcHBfaWQiOiJ4eHh4Iiwic2RrIjp7fX0sImNsaWVudCI6eyJjbGllbnRfaWQiOiJ1cGRhdGVtZXNtczMifSwiZGV2aWNlIjp7InBsYXRmb3JtIjp7fX0sInNlc3Npb24iOnt9LCJhdHRyaWJ1dGVzIjp7InNlbmRlcl9yZXF1ZXN0X2lkIjoiOGY4MDg1ZDMtMTVkZC00MjJjLTliNTMteHh4eHgiLCJjYW1wYWlnbl9hY3Rpdml0eV9pZCI6ImUzMDdjMTk5NTkyYTQxYTI4MGE3M2RmODAyMjk5ZDgxIiwiZGVzdGluYXRpb25fcGhvbmVfbnVtYmVyIjoiKzF4eHh4IiwicmVjb3JkX3N0YXR1cyI6IlNVQ0NFU1NGVUwiLCJpc29fY291bnRyeV9jb2RlIjoiVVMiLCJ0cmVhdG1lbnRfaWQiOiIwIiwibnVtYmVyX29mX21lc3NhZ2VfcGFydHMiOiIxIiwibWVzc2FnZV9pZCI6Inh4eHgiLCJtZXNzYWdlX3R5cGUiOiJUcmFuc2FjdGlvbmFsIiwiY2FtcGFpZ25faWQiOiJiYzM3MjdjMGVlMmM0MjhiODc2NDg5ZGU1ODIzMGM1MiIsImN1c3RvbWVyX2NvbnRleHQiOiJ7XCJ1c2VySWRcIjpcIlVzZXIzXCJ9In0sIm1ldHJpY3MiOnsicHJpY2VfaW5fbWlsbGljZW50c191c2QiOjY0NS4wfSwiYXdzQWNjb3VudElkIjoieHh4eCJ9Cg=="
      };

      const processor = new Processor(options);

      processor.defaultEvent(_record).then((resp) => {
        expect(resp).to.equal(_record.data);
        done();
      }).catch((err) => {
        done(err);
      });

    });



});
