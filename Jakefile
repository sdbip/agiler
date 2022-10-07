/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { ESLint } = require('eslint')

task('default', [ 'lint' ])

task('lint', async () => {
  const eslint = new ESLint()
  const result = await eslint.lintFiles([ '**/*.ts', '**/*.js', 'Jakefile' ])

  const formatter = await eslint.loadFormatter('compact')
  const resultText = formatter.format(result)

  const hasErrors = result.filter(r => r.errorCount > 0).length > 0

  if (hasErrors) fail(resultText)
  console.log(resultText)
})
