/* eslint-disable @typescript-eslint/no-var-requires */
const { ESLint } = require('eslint')
const { desc, task, fail } = require('jake')
const c = require('ansi-colors')

desc('Builds the application')
task('default', [ 'lint' ])

desc('Lints all .js and .ts files except those ignored by .eslintrc.yml')
task('lint', async () => {
  process.stdout.write(c.blue('Linting '))

  const eslint = new ESLint()
  const result = await eslint.lintFiles([ '**/*.ts', '**/*.js', 'Jakefile' ])

  const formatter = await eslint.loadFormatter('compact')
  const resultText = formatter.format(result)

  const hasErrors = result.filter(r => r.errorCount > 0).length > 0

  process.stdout.write('.\n')
  process.stdout.write(resultText)
  if (hasErrors) fail(resultText)
})
