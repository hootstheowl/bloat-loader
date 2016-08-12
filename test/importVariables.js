const assert = require('assert');
const bloatLoader = require('../index.js');
const testSection = 'Variables';

describe(`${testSection}: Import default Variable`, function() {
  let bloatedSource;
  const source = `(()=>{
    import defaultVariable from 'files/import/variables';
    return defaultVariable;
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

describe(`${testSection}: Import Variables`, function() {
  let bloatedSource;
  const source = `(() => {
    import { variableOne, variableTwo, variableThree } from 'files/import/variables';
    return [ variableOne, variableTwo, variableThree ];
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