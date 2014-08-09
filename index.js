'use strict';


var _ = require('lodash');
var debug = require('debug')('engine-cache');


/**
 * Create a new instance of `Engines`, optionally
 * passing the default `options` to use.
 *
 * **Example:**
 *
 * ```js
 * var Engines = require('engine-cache')
 * var engines = new Engines()
 * ```
 *
 * @class `Engines`
 * @param {Object} `options` Default options to use.
 * @api public
 */

function engines (options) {
  engines.init(options);
  return engines;
}


/**
 * Options cache
 *
 * @type {Object}
 */

engines.options = {};


/**
 * Engine cache
 *
 * @type {Object}
 */

engines.cache = {};


/**
 * Initialize defaults.
 *
 * @api private
 */

engines.init = function(opts) {
  debug('init', arguments);
  engines.options = {};
  engines.cache = {};
  engines.extend(opts);
  engines.defaultEngines();
};


/**
 * Load default engines
 *
 * @api private
 */

engines.defaultEngines = function() {
  debug('defaultEngines', arguments);
  engines.register('tmpl', require('./defaults/lodash'));
  engines.register('*', require('./defaults/noop'));
};


/**
 * Extend the options with the given `obj`.
 *
 * ```js
 * engines.extend('a', true)
 * engines.extend('a')
 * // => true
 * ```
 *
 * @method extend
 * @param {Object} `obj`
 * @return {Object} `engines` to enable chaining.
 * @api public
 */

engines.extend = function(obj) {
  this.options = _.extend({}, this.options, obj);
  return this;
};


/**
 * Set or get an option.
 *
 * ```js
 * engines.option('a', true)
 * engines.option('a')
 * // => true
 * ```
 *
 * @method option
 * @param {String} `key`
 * @param {*} `value`
 * @return {Object} `engines` to enable chaining.
 * @api public
 */

engines.option = function(key, value) {
  var args = [].slice.call(arguments);

  if (args.length === 1 && typeof key === 'string') {
    return engines.options[key];
  }

  if (typeof key === 'object') {
    _.extend.apply(_, [engines.options].concat(args));
    return engines;
  }

  engines.options[key] = value;
  return engines;
};


/**
 * Register the given view engine callback `fn` as `ext`.
 *
 * ```js
 * var consolidate = require('consolidate')
 * engines.register('hbs', consolidate.handlebars)
 * ```
 *
 * @param {String} `ext`
 * @param {Function|Object} `fn` or `options`
 * @param {Object} `options`
 * @return {Object} `engine` to enable chaining
 * @api public
 */

engines.register = function (ext, options, fn) {
  debug('register', arguments);

  var engine = {};

  if (arguments.length === 2) {
    fn = options;
    options = {};
  }

  if (typeof fn === 'function') {
    engine = fn;
    engine.render = fn.render;
  } else if (typeof fn === 'object') {
    engine = fn || engines.noop;
    engine.renderFile = fn.renderFile || fn.__express;
  }

  engine.options = fn.options || options || {};

  if (typeof engine.render !== 'function') {
    throw new Error('Engines are expected to have a `render` method.');
  }

  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  debug('registered %s: %j', ext, engine);

  engines.cache[ext] = engine;
  return engines;
};


/**
 * Load an object of engines onto the `cache`.
 * Mostly useful for testing, but exposed as
 * a public method.
 *
 * ```js
 * engines.load(require('consolidate'))
 * ```
 *
 * @param  {Object} `engines`
 * @return {Object} `Engines` to enable chaining.
 * @api public
 */

engines.load = function(obj) {
  debug('load', arguments);

  _.forIn(obj, function (value, key) {
    if (value.hasOwnProperty('render')) {
      engines.register(key, value);
    }
  });

  return engines;
};


/**
 * Return the engine stored by `ext`. If no `ext`
 * is passed, the entire cache is returned.
 *
 * ```js
 * var consolidate = require('consolidate')
 * engine.set('hbs', consolidate.handlebars)
 * engine.get('hbs')
 * // => {render: [function], renderFile: [function]}
 * ```
 *
 * @method get
 * @param {String} `ext` The engine to get.
 * @return {Object} The specified engine.
 * @api public
 */

engines.get = function(ext) {
  if (!ext) {
    return this.cache;
  }

  ext = ext || this.noop;
  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  var engine = this.cache[ext];
  if (!engine) {
    engine = this.cache['*'];
  }
  return engine;
};


/**
 * Remove `ext` from the cache, or if no value is
 * specified the entire cache is reset.
 *
 * **Example:**
 *
 * ```js
 * engines.clear()
 * ```
 *
 * @chainable
 * @method clear
 * @api public
 */

engines.clear = function(ext) {
  if (ext) {
    if (ext[0] !== '.') {
      ext = '.' + ext;
    }
    delete this.cache[ext];
  } else {
    this.cache = {};
  }
};


module.exports = engines;