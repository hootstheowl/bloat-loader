'use strict';

var fs = require('fs');
var loaderUtils = require('loader-utils');

function bloat(filename, source) {
  var result = source;
  var matchRules = [
    // import something from 'my/directory'
    /^\s*import\s[\s{]*(\w[,\s\w]*)[\s}]*\sfrom\s+['"](.*)['"].*/gm,
    // import 'my/directory'
    /^\s*import\s['"](.*)['"].*/gm,
    // var something = require('my/directory')
    /^\s*(?:var|let|const)\s+(\w+)\s*=\s*require\(['"](.*)['"]\).*/gm,
    // require('my/directory')
    /^\s*require\(['"](.*)['"]\).*/gm,
  ];
  for (var i = 0; i < matchRules.length; i++) {
    var regexp = matchRules[i];
    var matches = getMatches(source, regexp);
    if (matches.length > 0) {
      result = bloatMatches(filename, result, matches);
    }
  }
  return result;
};

function getMatches(source, regexp) {
  var matches = [];
  var match;
  while ((match = regexp.exec(source)) !== null) {
    matches.push(match);
  }
  return matches;
};

function bloatMatches(filename, source, matches) {
  var nextSource = source;
  for (var i = 0; i < matches.length; i++) {
    var match = matches[i];
    var matchFile = getRelativeFilename(
      filename, match[2]
    );
    var moduleNames = match[1].split(',');
    var sources = [];
    var file = fs.readFileSync(matchFile, 'utf8');
    file = file.replace(/^export\s+(?:default)*/gm, '');
    for (var i = 0; i < moduleNames.length; i++) {
      var module = eval(`(function(){
        ${file}
        return ${moduleNames[i]};
      }())`);
      var moduleSource = module.toString();
      if (moduleSource.match(
        /^(?:var|let|const|class|function)\s+[^\(]/
      ) === null) {
        moduleSource = `var ${moduleNames[i]} = ${moduleSource}`;
      }
      sources.push(moduleSource.toString());
    }
    nextSource = nextSource.replace(match[0], sources.join('\n'));
  }
  return nextSource;
};

function getRelativeFilename(sourceFilename, relativeFilename) {
  var newFilename = sourceFilename;
  var lowerDirectories = relativeFilename.match(/^(\.\.\/)/);
  if (lowerDirectories !== null) {
    for (var i = 0; i < lowerDirectories.length; i++) {
      if (lowerDirectories[i] === '') {
        continue;
      }
      newFilename = newFilename.replace(/(\/[^/]+)$/, '');
    }
  } else {
    newFilename = newFilename.replace(/(\/[^/]+)$/, '');
  }
  return newFilename+'/'+relativeFilename.replace(/^(\.\.\/)+/, '')+'.js';
};

module.exports = function(source, map, filename, testing) {
  if (testing === true) {
    return bloat(filename, source);
  }
  this.cacheable && this.cacheable();
  var result = '';
  var callback = this.async();
  var webpackRemainingChain = loaderUtils.getRemainingRequest(this).split('!');
  var filename = webpackRemainingChain[webpackRemainingChain.length - 1];
  try {
    result = bloat(filename, source);
  } catch (e) {
    throw new Error(e);
  }
  if (this.async) {
    this.callback(null, result, map)
  } else {
    return result;
  }
};
