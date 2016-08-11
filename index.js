'use strict';

var fs = require('fs');
var loaderUtils = require('loader-utils');

function BloatLoader(filename, source) {
  this.filename = filename;
  this.source = source;
  this.matchRules = [
    // import something from 'my/directory'
    /^import\s[\s{]*(\w[,\s\w]*)[\s}]*\sfrom\s+['"](.*)['"].*/gm,
    // import 'my/directory'
    /^import\s['"](.*)['"].*/gm,
    // var something = require('my/directory')
    /^(?:var|let|const)\s+(\w+)\s*=\s*require\(['"](.*)['"]\).*/gm,
    // require('my/directory')
    /^require\(['"](.*)['"]\).*/gm,
  ];
};

BloatLoader.prototype.init = function() {
  var result = this.source;
  for (var i = 0; i < this.matchRules.length; i++) {
    var regexp = this.matchRules[i];
    var matches = this.getMatches(this.source, regexp);
    if (matches.length > 0) {
      result = this.bloatMatches(result, matches);
    }
  }
  return result;
};

BloatLoader.prototype.getMatches = function(source, regexp) {
  var matches = [];
  var match;
  while ((match = regexp.exec(source)) !== null) {
    matches.push(match);
  }
  return matches;
};

BloatLoader.prototype.bloatMatches = function(source, matches) {
  var nextSource = source;
  for (var i = 0; i < matches.length; i++) {
    var match = matches[i];
    var matchFile = this.getRelativeFilename(
      this.filename, match[2]
    );
    var file = fs.readFileSync(matchFile, 'utf8');
    if (!file) {
      continue;
    }
    nextSource = nextSource.replace(match[0], file);
  }
  return nextSource;
};

BloatLoader.prototype.getRelativeFilename = function(
  sourceFilename, relativeFilename
) {
  var lowerDirectories = relativeFilename.match(/^(\.\.\/)/);
  var newFilename = sourceFilename;
  for (var i = 0; i < lowerDirectories.length; i++) {
    if (lowerDirectories[i] === '') {
      continue;
    }
    newFilename = newFilename.replace(/(\/[^/]+)$/, '');
  }
  return newFilename+'/'+relativeFilename.replace(/^(\.\.\/)+/, '')+'.js';
};

module.exports = function(source, map) {
  this.cacheable && this.cacheable();
  var result = '';
  var callback = this.async();
  var webpackRemainingChain = loaderUtils.getRemainingRequest(this).split('!');
  var filename = webpackRemainingChain[webpackRemainingChain.length - 1];
  var loader = new BloatLoader(filename, source);
  try {
    result = loader.init();
  } catch (e) {
    throw new Error(e);
  }
  this.callback(null, result, map);
};
