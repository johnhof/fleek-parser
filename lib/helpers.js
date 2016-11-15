'use strict';

let _ = require('lodash');
let defaults = require('merge-defaults');
let jsonRefs = require('json-refs');
let traverse = require('traverse');
let deasync = require('deasync');
let resolveRefs = deasync(jsonRefs.resolveRefs);
let Path = require('path');

//
// Select
//
// Find sub property of object
//
// Parameters:
//   obj
//     [Object] - target
//   query
//     [string] - query selector
//
//
let select = module.exports.select = function (obj, query) {
  let querySplit = (query || '').split('.');
  let result = obj || this;
  let depthCount = 0;

  try {
    _.each(querySplit, function (propName) {

      // Check for arrays
      if (/\[\d\]/.test(propName)) {
        let leadMatch = propName.match(/^(.*?)\[/) || [];
        let trailMatch = propName.match(/.*\](.*)$/) || [];
        let leadingProp = leadMatch[1];
        let trailingProp = trailMatch[1];
        let arrOnly = propName.replace(leadingProp, '');
        arrOnly = arrOnly.replace(trailingProp, '');
        arrOnly = _.compact(arrOnly.replace(/\[/g, '').split(']'));

        result = result[leadingProp];
        _.each(arrOnly, function (index) { result = result[parseInt(index, 10)]; });

        result = trailingProp ? result[trailingProp] : result;

      // Simple prop
      } else {
        result = result[propName];
      }
    });
  } catch (e) {
    result = undefined;
  }

  return result;
};

//
// Deep Key Search
//
// Check if a sub key exists
//
// Parameters:
//   obj
//     [Object] - target
//   keyword
//     [string] - key to look for
//
//
let deepKeySearch = module.exports.deepKeySearch = function (object, keyword) {
  let found = false;
  let queue = [object || {}];
  while (queue.length) {
    let obj = queue.pop();
    _.each(obj, (val, key) => {
      if (key === keyword) {
        found = true;
        return false;
      }

      if (_.isArray(val)) {
        _.each(val, (v, i) => {
          queue.push(v);
        });
      }

      if (_.isPlainObject(val)) {
        queue.push(val);
      }
    });

    if (found) break;
  }

  return found;
};

//
// Path to absolute
//
// Normalize both relative and absolute paths to be absolue (relative start with `.`)
//
// Parameters:
//   basePath
//     [String] - base path to resolve relative paths
//
//   InitPath
//     [String] - path to build to, abolute or relative
//
//
exports.pathToAbsolute = function (basePath, initPath) {
  if (!(_.isString(basePath) && _.isString(initPath))) { throw Error('pathtoAbsolute requires both basePath and initPath to be strings'); }

  var result = null;

  // Relative
  if (~initPath.indexOf('.') && initPath.indexOf('/') !== 0) {
    let pathSplit = initPath.split('/');
    pathSplit.shift();
    initPath = pathSplit.join('/');
    initPath = initPath.indexOf('/') === 0 ? initPath : '/' + initPath;
    result   = basePath + initPath;

  // Absolute
  } else {
    result = initPath;
  }

  return result;
};


//
// Path to absolute
//
// Convert the swagger into a valid json object
//
// Parameters:
//   swagger
//     [Mixed] - swagger object to interpret (string path, string json, object)
//
//
module.exports.inpterpretSwagger = function (swagger) {
  // Path or JSON string
  if (_.isString(swagger)) {

    // Resolve path
    if (swagger.indexOf('{') !== 0) {
      let path;
      if (swagger.indexOf('/') !== 0) {
        path = swagger;
      } else {
        path = exports.pathToAbsolute(process.cwd(), swagger) || '';
      }

      path = /\.json$/.test(path) ? path : path + '.json';
      path = Path.resolve(path);
      try {
        swagger = require(path);
      } catch (e) {
        // Console.log(e.stack);
        throw Error('failed to load swagger file: ' + path);
      }
    }

    swagger = _.isString(swagger) ? JSON.parse(swagger) : swagger;
  }

  // Object
  if (_.isObject(swagger)) {
    return swagger;
  } else {
    throw Error('Failed to interpret swagger docs');
  }
};


//
// Compose Swagger
//
// Resolve refs, and keyword (eg: allOf)
//
// Parameters:
//   swagger
//     [Object] - swagger object to compose
//
//
module.exports.composeSwagger = function (swagger, opts) {
  // Resolve relative links
  let obj = resolveRefs(swagger, opts);
  let shouldTraverse = deepKeySearch(obj, 'allOf');
  while (shouldTraverse) {
    traverse(obj).forEach(function (prop) {
      if (prop !== null && prop.allOf) {
        let inPlace = {};
        _.each(prop.allOf, (oneOf, key) => {
          // Patch support for directly nested allOf arrays
          if (oneOf.allOf && inPlace.allOf) {
            _.each(oneOf.allOf, (nestedOne) => {
              inPlace.allOf.push(nestedOne);
            });
          } else {
            inPlace = defaults(oneOf, inPlace);
          }
        });

        // Resolve the compiled object against the existing base level object
        delete prop.allOf;
        inPlace = defaults(prop, inPlace);

        let accessor = this;
        accessor.update(inPlace, true);
      }
    });

    shouldTraverse = deepKeySearch(obj, 'allOf');
  }

  return obj;
};
