'use strict'

const mocha = require('mocha');
const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;

const FleekParser  = require('..').FleekParser;

describe('Parser', () => {
  beforeEach(() => {
  });
  afterEach(() => {
  });

  describe('constructor', () => {

  });

  describe('parseSync', () => {
    describe('Should support internal refs', () => {
      let result = (new FleekParser()).parseSync(`${__dirname}/spec/internal_ref/index.json`);
      console.log(result)
    });

    describe('Should support external, local refs', () => {
      // (new FleekParser()).parseSync(`${__dirname}/spec/local_ref/index.json`)
    });
  });

  describe('External helpers', () => {
    describe('.extractSwagger', () => {
      it('should return an object for valid stringified swagger JSON', () => {
        let valid = '{ "swagger": "2.0", "paths": [], "info": { "version": "test", "title": "test" } }';
        expect((new FleekParser()).extractSwagger(valid)).to.be.an('object');
      });

      it('should return an object for a valid swagger object', () => {
        let valid = { swagger: '2.0', paths: [], info: { version: 'test', title: 'test' } };
        expect((new FleekParser()).extractSwagger(valid)).to.be.an('object');
      });

      it('should return an object for valid stringified swagger JSON', () => {
        expect((new FleekParser()).extractSwagger(`${__dirname}/spec/min.json`)).to.be.an('object');
      });

      it('should error out for no parameters', () => {
        expect(() => (new FleekParser()).extractSwagger()).to.throw(Error);
      });

      it('should error out for invalid json strings', () => {
        expect(() => (new FleekParser()).extractSwagger('{ foo: bar }')).to.throw(Error);
      });

      it('should error out for invalid files', () => {
        expect(() => (new FleekParser()).extractSwagger(__filename + '_foo')).to.throw(Error);
      });

      it('should error out for invalid swagger objects', () => {
        expect(() => (new FleekParser()).extractSwagger({ swagger: '2.0'})).to.throw(Error);
      });
    });

    describe('.isSwaggerJson', () => {
      it('should return true if the parsed json fits minimum swagger spec requirements', () => {
        let valid = '{ "swagger": "2.0", "paths": [], "info": { "version": "test", "title": "test" } }';
        expect((new FleekParser()).isSwaggerJson(valid)).to.be.true;
      });

      it('should return false for invalid json, instead of throwing a error', () => {
        expect((new FleekParser()).isSwaggerJson('{}asdf')).to.be.false;
      });

      it('should return false if the parsed json is missing the minimum swagger spec requirements', () => {
        expect((new FleekParser()).isSwaggerJson('{}')).to.be.false;

        // invalid swagger
        expect((new FleekParser()).isSwaggerJson('{ "paths": [], "info": { "version": "test", "title": "test" } }')).to.be.false;
        expect((new FleekParser()).isSwaggerJson('{ "swagger": 1, "paths": [], "info": { "version": "test", "title": "test" } }')).to.be.false;

        // invalid path
        expect((new FleekParser()).isSwaggerJson('{ "swagger": "2.0", "info": { "version": "test", "title": "test" } }')).to.be.false;
        expect((new FleekParser()).isSwaggerJson('{ "swagger": "2.0", "paths": false, "info": { "version": "test", "title": "test" } }')).to.be.false

        // invalid info
        expect((new FleekParser()).isSwaggerJson('{ "swagger": "2.0", "paths": [] }')).to.be.false;
        expect((new FleekParser()).isSwaggerJson('{ "swagger": "2.0", "paths": [], "info": true }')).to.be.false

        // invalid info.version
        expect((new FleekParser()).isSwaggerJson('{ "swagger": "2.0", "paths": [], "info": { "title": "test" } }')).to.be.false;
        expect((new FleekParser()).isSwaggerJson('{ "swagger": "2.0", "paths": [], "info": { "version": 12, "title": "test" } }')).to.be.false

        // invalid info.title
        expect((new FleekParser()).isSwaggerJson('{ "swagger": "2.0", "paths": [], "info": { "version": "test" } }')).to.be.false;
        expect((new FleekParser()).isSwaggerJson('{ "swagger": "2.0", "paths": [], "info": { "version": "test", "title": {} } }')).to.be.false
      });
    });

    describe('isSwaggerObj', () => {
      it('should return true if the object fits minimum swagger spec requirements', () => {
        let valid = { swagger: '2.0', paths: [], info: { version: 'test', title: 'test' } };
        expect((new FleekParser()).isSwaggerObj(valid)).to.be.true;
        valid.rider = true;
        expect((new FleekParser()).isSwaggerObj(valid)).to.be.true;
      });

      it('should return false if the object is missing the minimum swagger spec requirements', () => {
        expect((new FleekParser()).isSwaggerObj({})).to.be.false;

        // invalid swagger
        expect((new FleekParser()).isSwaggerObj({ paths: [], info: { version: 'test', title: 'test' } })).to.be.false;
        expect((new FleekParser()).isSwaggerObj({ swagger: 1, paths: [], info: { version: 'test', title: 'test' }})).to.be.false;

        // invalid path
        expect((new FleekParser()).isSwaggerObj({ swagger: '2.0', info: { version: 'test', title: 'test' } })).to.be.false;
        expect((new FleekParser()).isSwaggerObj({ swagger: '2.0', paths: false, info: { version: 'test', title: 'test' } })).to.be.false

        // invalid info
        expect((new FleekParser()).isSwaggerObj({ swagger: '2.0', paths: [] })).to.be.false;
        expect((new FleekParser()).isSwaggerObj({ swagger: '2.0', paths: [], info: true })).to.be.false

        // invalid info.version
        expect((new FleekParser()).isSwaggerObj({ swagger: '2.0', paths: [], info: { title: 'test' } })).to.be.false;
        expect((new FleekParser()).isSwaggerObj({ swagger: '2.0', paths: [], info: { version: 12, title: 'test' } })).to.be.false

        // invalid info.title
        expect((new FleekParser()).isSwaggerObj({ swagger: '2.0', paths: [], info: { version: 'test' } })).to.be.false;
        expect((new FleekParser()).isSwaggerObj({ swagger: '2.0', paths: [], info: { version: 'test', title: {} } })).to.be.false
      });
    });
  });

  describe('Internal helpers', () => {
    describe('._safeFileRead', () => {
      it('should parse valid files', () => {
        let obj = (new FleekParser({ debug: true }))._safeFileRead(__filename);
        expect(obj).to.not.be.false;
        expect(obj).instanceOf(Buffer);
      });

      it('should return false on failure, not throw an error', () => {
        let badPath = __filename + '_foo';
        expect(() => (new FleekParser())._safeFileRead(badPath)).not.to.throw(Error);
        expect((new FleekParser())._safeFileRead(badPath)).to.be.false;
      });

    });

    describe('._safeJsonParse', () => {
      it('should parse valid json into an object', () => {
        let json = '{ "test": true }';
        let obj = (new FleekParser({ debug: true }))._safeJsonParse(json);
        expect(obj).to.not.be.false;
        expect(obj).not.be.a('string');
        expect(obj).be.an('object');
      });

      it('should return false on failure, not throw an error', () => {
        let json = '{ test: true }';
        expect(() => (new FleekParser())._safeJsonParse(json)).not.to.throw(Error);
        expect((new FleekParser())._safeJsonParse(json)).to.be.false;
      });
    });

    describe('._debug', () => {
      beforeEach(() => sinon.spy(console, 'log'));
      afterEach(() => console.log.restore());

      it('should not call console.log() if debug is not true', () => {
        (new FleekParser())._debug();
        (new FleekParser({ debug: false }))._debug();
        (new FleekParser({ debug: 1 }))._debug();
        expect(console.log.called).to.be.false;
      });

      it('should call console.log() if debug is true', () => {
        (new FleekParser({ debug: true }))._debug();
        expect(console.log.called).to.be.true;
      });
    });
  });
});
