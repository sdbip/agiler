/* eslint-disable @typescript-eslint/no-var-requires */
const { ESLint } = require('eslint')
const jake = require('jake')
const c = require('ansi-colors')
const rmrf = require('rimraf')
const shelljs = require('shelljs')
const { desc, task, fail } = jake

jake.addListener('complete', () => { console.log(c.green('\nBUILD OK!')) })

desc('Builds the application')
task('default', [ 'lint', 'test', 'bundle' ])

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
  process.stdout.write(c.italic(c.blue('Test on Google ')))

  await new Promise((resolve, reject) => {
    const child = shelljs.exec('wtr --node-resolve --esbuild-target auto', { async: true, silent: true })

    child.stdout.on('data', function(data) {
      if (data.trim().length === 0) return

      const regexes = {
        /* eslint-disable no-control-regex */
        redX: /\x1B\[31mx\x1B\[89m\x1B\[0m\x1B\[0m\n/g,
        badControlChars: /\x1B\[2K|\x1B\[1A|\x1B\[G/g,
        /* eslint-enable no-control-regex */
        initialLine: /.* test files\.\.\.\n\n/,
      }

      const mergedDots = data
        .replace(regexes.initialLine, '')
        .replace(regexes.badControlChars, '')
        .replace(regexes.redX, c.red('!'))
        .replace(/\.\n/g, '.')
        .trim()

      process.stdout.write(mergedDots)
    })

    child.on('exit', code => {
      process.stdout.write('\n')

      if (code > 0) reject()
      else resolve()
    })
  })
})

desc('Run backend tests')
task('backend_tests', async () => {
  process.stdout.write(c.italic(c.blue('Testing ')))

  await new Promise((resolve, reject) => {
    const promise = { resolve, reject }
    const child = shelljs.exec('source .env && mocha -R dot', { async: true, silent: true })
    let result = []
    child.stdout.on('data', function(data) {
      // if (!result.length) data = data.trim()
      switch (data) {
        case '.':
        case '\n  .':
          process.stdout.write('.')
          break
        case '\n  !':
        case '!':
          process.stdout.write(c.red('!'))
          break
        default: {
          result.push(data)
          break
        }
      }
    })

    child.on('exit', code => {
      process.stdout.write('\n')
      if (code > 0) {
        console.error(`\n${result.join('').trim()}\n`)
        promise.reject()
      } else {
        promise.resolve()
      }
    })
  })
})
