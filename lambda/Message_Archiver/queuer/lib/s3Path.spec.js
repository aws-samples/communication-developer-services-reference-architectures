'use strict';

const sinon = require('sinon');
const assert = require('chai').assert;
const expect = require('chai').expect;
const path = require('path');
const parse = require('url').parse;
const AWS = require('aws-sdk-mock');
AWS.setSDK(path.resolve('./node_modules/aws-sdk'));


const {generateFilePath} = require('./s3Path.js');

let sandbox;

describe('S3Path', function() {

    beforeEach(function() {
        sandbox = sinon.createSandbox();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('generateFilePath returns an appropriate S3 URL with UTC time codes', function(done) {

      process.env.S3_BUCKET = 'test_bucket_name';

      const _endpointId = 'test_endpoint_id';
      const _eventTimestamp = 1591996342301;

      const _resp = generateFilePath(_endpointId, _eventTimestamp);
      console.log(_resp);
      expect(_resp).to.be.a('string');
      expect(_resp.substr(0, 5)).to.equal('s3://');

      const uri = parse(_resp);
      expect(uri.hostname).to.equal('test_bucket_name');
      expect(decodeURIComponent(uri.pathname).substring(0, 40)).to.equal('/archive/test_endpoint_id/2020/06/12/21/');

      done();

    });

});
