/* eslint-disable @typescript-eslint/no-var-requires */
const { ESLint } = require('eslint')
const jake = require('jake')
const c = require('ansi-colors')
const rmrf = require('rimraf')
const shelljs = require('shelljs')
const { desc, task, fail } = jake

jake.addListener('complete', () => { console.log('BUILD OK!') })

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
  const hasWarnings = result.filter(r => r.warningCount > 0).length > 0

  process.stdout.write(hasErrors ? '!\n' : '.\n')
  if (hasErrors || hasWarnings) process.stdout.write(`${resultText}\n`)
  if (hasErrors) fail(resultText)
})

desc('Bundle browser code')
task('bundle', [ 'create_bundle', 'clean_bundle' ], () => {
  process.stdout.write(c.blue('\n'))
})

task('create_bundle', async () => {
  process.stdout.write(c.blue('Bundling '))

  const result = shelljs.exec('yarn webpack', { silent: true }) // && rm -rf lib

  if (result.code > 0) {
    process.stdout.write('!\n')
    process.stdout.write(result.stdout.replace(/(ERROR.*$)/gm, c.red('$1')))
    fail(result.stderr)
  }
  process.stdout.write('.')
})

task('clean_bundle', async () => {
  await new Promise((resolve, reject) => rmrf('lib', error => {
    if (error) reject(error)
    else resolve()
  }))
  process.stdout.write('.')
})

desc('Run all tests')
task('test', [ 'backend_tests', 'browser_tests' ])

desc('Run browser tests')
task('browser_tests', async () => {
  process.stdout.write(c.italic(c.blue('Browser Testing ')))

  const wtr = require('@web/test-runner')
  const runner = await wtr.startTestRunner({
    // WTR believe they have a Mocha-esque 'dot' reporter, but
    // it actually stacks dots vertically instead of horisontally,
    // making it utterly useless. It is also very hard to create
    // a custom reporter, because the tool deletes whatever is
    // sent to process.stdout. Only console.log() seems to work,
    // and that inserts a newline for each call.
    // 
    // config: { reporters: [ wtr.dotReporter() ] },
    autoExitProcess: false,
    argv: [
      '--node-resolve',
      '--esbuild-target',
      'auto',
    ],
  })
  await new Promise(resolve => {
    runner.on('stopped', resolve)
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
          process.stdout.write(data)
          break
        case '!':
          process.stdout.write(c.red(data))
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
