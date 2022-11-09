/* eslint-disable @typescript-eslint/no-var-requires */
const { ESLint } = require('eslint')
const jake = require('jake')
const c = require('ansi-colors')
const rmrf = require('rimraf')
const shelljs = require('shelljs')
const { desc, task, fail, directory } = jake
const fs = require('fs').promises

jake.addListener('complete', () => { console.log(c.green('\nBUILD OK!')) })

const lazyTasksDirectory = 'lazy_tasks'
directory(lazyTasksDirectory)

const deglob = (glob, excludes) => {
  const filelist = new jake.FileList(glob)
  filelist.exclude('node_modules')
  if (excludes) filelist.exclude(excludes)
  return filelist.toArray()
}

const lazyTask = (name, dependencies, action) => {
  const outputPath = `${lazyTasksDirectory}/${name}.inc`
  task(name, [ outputPath ])
  jake.file(outputPath, dependencies.concat(lazyTasksDirectory), async () => {
    await action()
    await fs.writeFile(outputPath, new Date().toISOString())
  })
}

desc('Remove all intermediate log')
task('clean', async () => {
  await new Promise((resolve, reject) => rmrf(lazyTasksDirectory, error => {
    if (error) reject(error)
    else resolve()
  }))
})

desc('Builds the application')
task('default', [ 'lint', 'test', 'bundle' ])

desc('Launches the application')
task('start', [ 'lint', 'test', 'bundle', 'run' ])

desc('Lints all .js and .ts files except those ignored by .eslintrc.yml')
lazyTask('lint', deglob([ '**/*.ts', '**/*.js' ]), async () => {
  log.startTask('Linting')

  const eslint = new ESLint()
  const result = await eslint.lintFiles([ '**/*.ts', '**/*.js', 'Jakefile' ])

  const formatter = await eslint.loadFormatter('compact')
  const resultText = formatter.format(result)

  const hasErrors = result.filter(r => r.errorCount > 0).length > 0
  const hasWarnings = result.filter(r => r.warningCount > 0).length > 0

  log.progress(({ success: !hasErrors }))
  log.endTask()
  if (hasErrors || hasWarnings) log.text(`${resultText}\n`)
  if (hasErrors) fail(resultText)
})

desc('Bundle browser code')
lazyTask('bundle', deglob('frontend/**/*'), async () => {
  log.startTask('Bundling')

  const result = shelljs.exec('yarn webpack', { silent: true }) // && rm -rf lib

  if (result.code > 0) {
    log.progress({ success: false })
    log.endTask()
    log.text(result.stdout.replace(/(ERROR.*$)/gm, c.red('$1')))
    fail(result.stderr)
  }
  log.progress(({ success: true }))

  await new Promise((resolve, reject) => rmrf('lib', error => {
    if (error) reject(error)
    else resolve()
  }))
  log.progress(({ success: true }))
  log.endTask()
})

desc('Run all tests')
task('test', [ 'backend_tests', 'browser_tests' ])

desc('Run browser tests')
lazyTask('browser_tests', deglob([ 'frontend/browser-*/**/*', 'frontend/test/**/*' ], '**/*.spec.ts'), async () => {
  log.startTask('Testing browser code')

  await new Promise((resolve, reject) => {
    const child = shelljs.exec('wtr --node-resolve --esbuild-target auto', { async: true, silent: true })

    child.stdout.on('data', data => {
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

      log.text(mergedDots)
    })

    child.on('exit', code => {
      log.endTask()

      if (code > 0) reject()
      else resolve()
    })
  })
})

desc('Run backend tests')
lazyTask('backend_tests', deglob([ 'backend/**/*', 'frontend/src/**/*.ts', 'frontend/**/*.spec.ts' ]), async () => {
  log.startTask('Testing servers')

  await new Promise((resolve, reject) => {
    const promise = { resolve, reject }
    const child = shelljs.exec('source .env && mocha -R dot', { async: true, silent: true })
    let result = []
    child.stdout.on('data', data => {
      switch (data) {
        case '.':
        case '\n  .':
          log.progress(({ success: true }))
          break
        case '\n  !':
        case '!':
          log.progress(({ success: false }))
          break
        default: {
          result.push(data)
          break
        }
      }
    })

    child.on('exit', code => {
      const isError = code > 0
      log.endTask()
      if (isError) console.error(`${result.join('').trim()}\n`)
      if (isError) promise.reject()
      else promise.resolve()
    })
  })
})

task('run', async () => {
  log.task('Starting')
  shelljs.exec('source .env && ts-node-esm run.ts')
})

const log = {
  task: name => {
    log.startTask(name)
    log.endTask()
  },

  startTask: name => {
    log.text(`${c.blue(name)} `)
  },
  endTask: () => {
    log.text('\n')
  },
  progress: ({ success }) => {
    log.text(success ? '.' : c.red('!'))
  },

  text: text => {
    process.stdout.write(text)
  },
}
