'use strict'
module.exports = function (grunt) {
  const lintableFiles = [ 'Gruntfile.js', 'src/**/*.js', 'test/**/*.js' ]
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      target: lintableFiles,
    },
    watch: {
      files: lintableFiles,
      tasks: [ 'default' ],
    },
    mochaTest: {
      options: { reporter: 'min' },
      src: [ 'test/**/*.js' ],
    },
  })

  grunt.loadNpmTasks('grunt-eslint')
  grunt.loadNpmTasks('grunt-mocha-test')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.registerTask('default', [ 'eslint', 'mochaTest' ])
  grunt.registerTask('scan', [ 'watch' ])
}
