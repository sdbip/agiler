'use strict';
module.exports = function (grunt) {
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
      all: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', [ 'jshint' ]);
};
