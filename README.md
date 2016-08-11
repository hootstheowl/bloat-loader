# Bloat loader for [webpack](http://webpack.github.io/)

bloat-loader is a webpack loader that will replace all require() and import declarations with the requested file's source code. Effectively, bloating your code from this:
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

## Install

`npm install bloat-loader --save-dev`

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
