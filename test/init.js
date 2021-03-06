/*!
 * engine-cache <https://github.com/jonschlinkert/engine-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var engines = require('..');


describe('engines init', function() {
  beforeEach(function() {
    engines.clear();
  });

  describe('.defaults()', function() {
    it('should set defaults on the `options` object.', function() {
      engines.init({x: 'x', y: 'y', z: 'z'})

      engines.options.should.have.property('x');
      engines.options.should.have.property('y');
      engines.options.should.have.property('z');
    });
  });
});
