'use strict';

const fs = require('fs');
const loaderUtils = require('loader-utils');

function bloat(filename, source) {
  let result = source;
  const matchRules = [
    // import something from 'my/directory'
    /^\s*import\s[\s{]*(\w[,\s\w]*|\*\s+as\s+\w+)[\s}]*\sfrom\s+['"](.*)['"].*/gm,
    // import 'my/directory'
    /^\s*import\s['"](.*)['"].*/gm,
    // var something = require('my/directory')
    /^\s*(?:var|let|const)\s+(\w+)\s*=\s*require\(['"](.*)['"]\).*/gm,
    // require('my/directory')
    /^\s*require\(['"](.*)['"]\).*/gm,
  ];
  for (let i = 0; i < matchRules.length; i++) {
    const regexp = matchRules[i];
    const matches = getMatches(source, regexp);
    if (matches.length > 0) {
      result = bloatMatches(filename, result, matches);
    }
  }
  return result;
};

function getMatches(source, regexp) {
  const matches = [];
  let match;
  while ((match = regexp.exec(source)) !== null) {
    matches.push(match);
  }
  return matches;
};

function bloatMatches(filename, source, matches) {
  let nextSource = source;
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const matchFile = getRelativeFilename(
      filename, match[2]
    );
    const moduleNames = match[1].split(',');
    const sources = [];
    let matchFileSource = fs.readFileSync(matchFile, 'utf8');
        matchFileSource = matchFileSource.replace(
          /^export\s+(?:default)*/gm, ''
        );
    for (let i = 0; i < moduleNames.length; i++) {
      let moduleSource;
      const moduleName = moduleNames[i];
      if (moduleName.match(/\s+as\s+/) !== null) {
        moduleSource = getAliasedSource(
          moduleName, matchFileSource
        );
      } else {
        moduleSource = prependVariable(
          moduleName, getModuleSource(
            moduleName, matchFileSource
          )
        );
      }
      sources.push(moduleSource);
    }
    nextSource = nextSource.replace(match[0], sources.join('\n'));
  }
  return nextSource;
};

function getAliasedSource(moduleName, fileSource) {
  const names = moduleName.split(/\s+as\s+/);
  const name = names[0].replace(/\s/, '');
  const alias = names[1].replace(/\s/, '');
  let moduleSource = getModuleSource(name, fileSource);
  return prependVariable(
    alias, moduleSource.replace(name, alias)
  );
}

function getModuleSource(moduleName, fileSource) {
  const module = eval(`(function(){
    ${fileSource}
    return ${moduleName};
  }())`);
  return module.toString();
}

function prependVariable(moduleName, moduleSource) {
  if (moduleSource.match(
    /^(?:var|let|const|class|function)\s+[^\(]/
  ) === null) {
    moduleSource = `var ${moduleName} = ${moduleSource}`;
  }
  return moduleSource;
}

function getRelativeFilename(sourceFilename, relativeFilename) {
  let newFilename = sourceFilename;
  const lowerDirectories = relativeFilename.match(/^(\.\.\/)/);
  if (lowerDirectories !== null) {
    for (let i = 0; i < lowerDirectories.length; i++) {
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
  let result = '';
  const callback = this.async();
  const webpackRemainingChain = loaderUtils.getRemainingRequest(this).split('!');
  const sourceFilename = webpackRemainingChain[webpackRemainingChain.length - 1];
  try {
    result = bloat(sourceFilename, source);
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
  if (this.async) {
    this.callback(null, result, map)
  } else {
    return result;
  }
};
