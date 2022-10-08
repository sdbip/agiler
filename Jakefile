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
task('test', [ 'backend_tests', 'browser_tests' ])

desc('Run browser tests')
task('browser_tests', async () => {
  process.stdout.write(c.italic(c.blue('Browser Testing ')))

  const wtr = require('@web/test-runner')
  await wtr.startTestRunner({
    // WTR believe they have a Mocha-esque 'dot' reporter, but
    // it actually stacks dots vertically instead of horisontally,
    // making it utterly useless. It is also very hard to create
    // a custom reporter, because the tool deletes whatever is
    // sent to process.stdout. Only console.log() seems to work,
    // and that inserts a newline for each call.
    // 
    // config: { reporters: [ wtr.dotReporter() ] },
    argv: [
      '--node-resolve',
      '--esbuild-target',
      'auto',
    ],
  })
})

desc('Run backend tests')
task('backend_tests', async () => {
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
