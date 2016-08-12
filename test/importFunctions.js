var assert = require('assert');
var bloatLoader = require('../index.js');

describe('importDefaultFunction', function() {
  var bloatedSource;
  var source = `(()=>{
    import defaultFunction from 'files/import/functions';
    return defaultFunction();
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

describe('importFunctions', function() {
  var bloatedSource;
  var source = `(() => {
    import { functionOne, functionTwo, functionThree } from 'files/import/functions';
    return [ functionOne(), functionTwo(), functionThree() ];
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