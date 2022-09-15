'use strict';
module.exports = function (grunt) {
  const lintableFiles = ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js'];
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      target: lintableFiles
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

  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [ 'eslint', 'mochaTest' ]);
  grunt.registerTask('scan', [ 'eslint', 'mochaTest', 'watch' ]);
};
