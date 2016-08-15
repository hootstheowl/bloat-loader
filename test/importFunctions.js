const assert = require('assert');
const bloatLoader = require('../index.js');
const testSection = 'Functions';

describe(`${testSection}: Import default Function`, function() {
  let bloatedSource;
  const source = `(()=>{
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

describe(`${testSection}: Import Functions`, function() {
  let bloatedSource;
  const source = `(() => {
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

describe(`${testSection}: Import aliased Functions`, function() {
  let bloatedSource;
  const source = `(() => {
    import { functionOne as one, functionTwo as two, functionThree as three } from 'files/import/functions';
    return [ one(), two(), three() ];
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

describe(`${testSection}: Import all aliased Functions`, function() {
  let bloatedSource;
  const source = `(() => {
    import * as functions from 'files/import/functions';
    return [ functions.functionOne(), functions.functionTwo(), functions.functionThree() ];
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
