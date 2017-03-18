'use strict';

const FS = require('fs');
const PATH = require('path');
const TRAVERSE = require('traverse');

const TOSS = require('./helpers/toss');

let DEFAULTS = {
  debug: false
};

class FleekParser {
  constructor (opts = {}) {
    this.opts = opts;
    this.debug = opts.debug || DEFAULTS.debug;
    this.cache = {};
  }

  parse (swagger) {
    return new Promise((resolve, reject) => {
      resolve(this.parseSync(swagger));
    });
  }

  parseSync (input, options) {
    let base = this.extractSwagger(input);

require('fs').writeFileSync('/tmp/pre.json', JSON.stringify(base, null, '  '))

    let resolved = this._resolveRefs(base);
require('fs').writeFileSync('/tmp/post.json', JSON.stringify(resolved, null, '  '))


    // TODO: resolve AllOf
    let finalized = {};

    return finalized;
  }


  //
  // External helpers
  //


  // should return swagger from a variety of inputs. throws errors if unsucessful
  extractSwagger (param) {
    if (!param) return TOSS('Swagger not provided');; // falsy values are obviously invalid
    let result = false;

    // if a string was passed in
    if (typeof param === 'string') {
      // if the string is not stringified swagger json:
      // - try to interpret it as a path
      // - if it is a path, try to parse the file as json
      let str = param;
      if (!this.isSwaggerJson(param)) {
        let path = PATH.resolve(param);
        let buff = this._safeFileRead(param);
        if (!buff) TOSS(`Failed to read file [${path}]`);
        str = buff.toString('utf8');
      }

      // attempt to parse the JSON
      result = this._safeJsonParse(str);
      if (!result) TOSS('Failed to parse json file');
    } else {
      result = param;
    }

    if (!this.isSwaggerObj(result)) TOSS('Failed to extract valid swagger');
    return result;
  }

  // Returns true if valid stringified swagger is provided
  isSwaggerJson (str) {
    let obj = this._safeJsonParse(str) ||{};
    return this.isSwaggerObj(obj);
  }

  // Returns true if valid swagger is provided
  isSwaggerObj (obj) {
    let isString = (s) => (typeof s === 'string');
    let isArray = (a) => Array.isArray(a)
    return !!(isString(obj.swagger) && obj.paths
              && obj.info && isString(obj.info.version) && isString(obj.info.title));
  }

  //
  // Internal helpers
  //

  // Read file, returning false on failure
  _safeFileRead (path) {
    let result = false;
    try {
      result = FS.readFileSync(PATH.resolve(path));
    } catch (e) {
      this._debug(e);
      result = false;
    }
    return result;
  }

  // Parse JSON, returning false on failure
  _safeJsonParse (str) {
    if (typeof str !== 'string') return false;
    let parsed = false;
    try {
      parsed = JSON.parse(str);
    } catch (e) {
      this._debug(e);
      parsed = false;
    }
    return parsed;
  }

  // Resolve references in object
  _resolveRefs (obj, base) {
    let self = this;
    return TRAVERSE(obj).map(function (node) {
      if (node && node.$ref && typeof node.$ref === 'string') {
        // resolve internal refs
        if (node.$ref.indexOf('#') === 0) {
          this.update(self._resolveInternalJsonRef(node.$ref, obj));
          // recurse for external refs
        } else {

        }
      }
    });
  }

  // Resolve internal json reference from string
  _resolveInternalJsonRef (ref, obj) {
    if (typeof ref !== 'string') return;
    let rel = ref.replace(/.*#\//, '');
    let props = rel.split('/')
    let result = obj;
    for (let prop of props) {
      if (!result[prop]) return;
      result = result[prop];
    }
    return result;
  }

  _readJsonFile(path) {
    let file = false;
    try {
      file = require(path);
    } catch (e) {
      this._debug(e);
    }
    return file;
  }

  // Wrapper around console.log(), only logs if parser is set to debug
  _debug (e) {
    if (this.debug === true) {
      if (e && e.stack) console.log(e.stack)
      else console.log.apply(console, arguments);
    }
  }
};

module.exports = FleekParser;
module.exports.defaults = DEFAULTS;
