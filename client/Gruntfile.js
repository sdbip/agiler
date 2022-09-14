'use strict';
module.exports = function (grunt) {
  const lintableFiles = ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js'];
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [ 'jshint', 'watch' ]);
};
