/* eslint-disable @typescript-eslint/no-var-requires */
const { ESLint } = require('eslint')
const { desc, task, fail } = require('jake')
const c = require('ansi-colors')
const shelljs = require('shelljs')

desc('Builds the application')
task('default', [ 'lint', 'test' ])

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

desc('Run all tests')
task('test', async () => {
  process.stdout.write(c.italic(c.blue('Testing ')))

  await new Promise((resolve, reject) => {
    const child = shelljs.exec('source .env && mocha -R dot', { async: true, silent: true })
    let result = []
    child.stdout.on('data', function(data) {
      if (!result.length) data = data.trim()
      switch (data) {
        case '.':
        case '!':
          process.stdout.write(data)
          break
        default: {
          result.push(data)
          break
        }
      }
    })

    child.on('exit', code => {
      process.stdout.write('\n')
      if (code) reject(new Error(result.join('')))
      else resolve()
    })
  })
})
