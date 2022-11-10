import { runTests } from '@web/test-runner-mocha'
import { assert } from '@esm-bundle/chai'
import { MeasureComponent } from '../browser-src/measure-component'

runTests(() => {
  it('measures explicitly sized element to its parameters', () => {
    assert.deepEqual(
      MeasureComponent.instance.measure('<div style="height: 10px; width: 15px"></div>'),
      { height: 10, width: 15 })
  })
  it('measures unsized element to its content', () => {
    assert.deepEqual(
      MeasureComponent.instance.measure('<div><div style="height: 10px; width: 15px"></div></div>'),
      { height: 10, width: 15 })
  })
})
