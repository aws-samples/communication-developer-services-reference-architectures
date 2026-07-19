'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
var event, context;

describe('Tests index', function () {
    it('verifies successful response', async () => {
        const result = await app.handler(event, context)
	expect(result).to.be.an('string');
	expect(result).to.be.equal("Hello World!");
    });
});
