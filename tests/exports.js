'use strict'

let mocha   = require('mocha');
let expect  = require('chai').expect;
let _       = require('lodash');

let parser  = require('..');

describe('Exports', function () {
  it('should export the FleekParser class', () => {
    expect(new parser.FleekParser()).instanceOf(parser.FleekParser);
  });

  it('should export an initialized parser', () => {
    expect(parser).instanceOf(parser.FleekParser);
  });
});
