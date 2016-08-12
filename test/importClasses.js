var assert = require('assert');
var bloatLoader = require('../index.js');

describe('importDefaultClass', function() {
  var bloatedSource;
  var source = `(()=>{
    import DefaultClass from 'files/import/classes';
    var defaultClass = new DefaultClass();
    return defaultClass.init();
  })()`;
  it('should not throw an exception', function(){
    assert.doesNotThrow(
      function() {
        bloatedSource = bloatLoader(
          source, null, __filename, true
        )
      }, Error
    );
  });
  it('should evaluate to 0', function() {
    assert.equal(
      eval(bloatedSource), 0
    );
  });
});

describe('importClasses', function() {
  var bloatedSource;
  var source = `(() => {
    import { ClassOne, ClassTwo, ClassThree } from 'files/import/classes';
    var classOne = new ClassOne();
    var classTwo = new ClassTwo();
    var classThree = new ClassThree();
    return [ classOne.init(), classTwo.init(), classThree.init() ];
  })()`;
  it('should not throw an exception', function(){
    assert.doesNotThrow(
      function() {
        bloatedSource = bloatLoader(
          source, null, __filename, true
        )
      }, Error
    );
  });
  it('should evaluate to [ 1, 2, 3 ]', function() {
    assert.deepStrictEqual(
      eval(bloatedSource), [1,2,3]
    );
  });
});
