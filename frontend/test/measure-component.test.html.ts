import { runTests } from '@web/test-runner-mocha'
import { expect } from '@esm-bundle/chai'
import { MeasureComponent } from '../src/measure-component'

runTests(() => {
  it('measures explicitly sized element to its parameters', () => {
    expect(MeasureComponent.instance.measure('<div style="height: 10px; width: 15px"></div>'))
      .to.deep.equal({ height: 10, width: 15 })
  })
  it('measures unsized element to its content', () => {
    expect(MeasureComponent.instance.measure('<div><div style="height: 10px; width: 15px"></div></div>'))
      .to.deep.equal({ height: 10, width: 15 })
  })
})
