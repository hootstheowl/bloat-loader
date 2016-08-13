# Bloat loader for [webpack](http://webpack.github.io/)

bloat-loader is a webpack loader that will replace all import declarations with the requested file's source code. Effectively, bloating your code from this:
``` javascript
import FooBar from 'app/directory/FooBar';

const instance = new FooBar();
instance.init();
```
...to something like this:
``` javascript
class FooBar {
  constructor() {
    this.foo = 'bar';
  }
  init() {
    return this.foo;
  }
}

const instance = new FooBar();
instance.init();
```

## Currently Supported Syntax (v0.2.0):

Directly import the default:

`import myDefault from 'my-module'`

Import a single member of a module:

`import { myMember } from 'my-module'`

Import multiple members of a module:

`import { foo, bar } from 'my-module'`

See the [bloat-loader feature roadmap](https://github.com/hootstheowl/bloat-loader/wiki/Feature-Roadmap) for more information on upcoming syntax support.

## Install

### Via npm install

`npm install bloat-loader --save-dev`

### Requirements
bloat-loader uses ES2015+ features and **requires Node 4.4.5 or above**

## Usage

### Intended Usage
This loader should (probably) never be applied to an entire project and is intended for use cases where compiling a class or method's dependencies into one source is particularly useful (e.g. when creating a [Bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet)).

### Apply via webpack config

``` javascript
module.exports = {
  ...
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['bloat-loader'],
        include: path.join(__dirname, 'app/myBloatedFiles')
      }
    ]
  }
};
```
When using [Babel](https://babeljs.io/) or another transpiler, bloat-loader must be applied beforehand so that it's result can be transpiled:
``` javascript
...
        loaders: ['babel', 'bloat-loader'],
...
```
