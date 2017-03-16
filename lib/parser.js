'use strict';

const _ = require('lodash');
const PATH = require('path');
// const TOSS = require('helpers/toss');

class FleekParser {
  constructor (opts = {}) {
    this.opts = opts;
  }

  parse (swagger) {

  }

  isSwaggerString (str) {

  }

  isSwaggerObj (obj) {

  }


  // function (swagger, options={}) {
  // if (typeof swagger !== 'string') TOSS('Parser expects swagger documentation in the form of a string, path, or object');
  //
  // options = options || {};
  // if (!options.location && _.isString(swagger) && swagger.indexOf('{') < 0 && swagger.indexOf('.json') >= 0) {
  //   options.location = path.parse(helpers.pathToAbsolute(process.cwd(), swagger)).dir;
  // } else if (swagger._origin_) {
  //   options.location = path.parse(swagger._origin_).dir;
  // }
  //
  // swagger = helpers.inpterpretSwagger(swagger);
  // let compile = compiler(version || swagger.swagger);
  // return compile(swagger, options);
};

module.exports = FleekParser;
