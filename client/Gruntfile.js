'use strict';
module.exports = function (grunt) {
  const lintableFiles = ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js'];
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        globals: {
          describe: true,
          it: true,
        },
        bitwise: true,
        curly: false,
        eqeqeq: true,
        forin: true,
        immed: true,
        latedef: false,
        newcap: true,
        noarg: true,
        noempty: true,
        nonew: true,
        regexp: true,
        undef: true,
        strict: true,
        trailing: true,
        esversion: 6,
        quotmark: 'single',
        node: true
      },
      all: lintableFiles
    },
    watch: {
      files: lintableFiles,
      tasks: ['jshint']
    },
    mochaTest: {
      options: { reporter: 'dot' },
    src: ['test/**/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [ 'jshint', 'mochaTest', 'watch' ]);
};
