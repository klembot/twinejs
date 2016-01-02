module.exports = function(grunt) {
  // eslint checks JavaScript files for potential problems.

  grunt.config.merge({
    eslint: {
      target: ['src/**/*.js']
    },
  });

  // JSCS is a code style formatter for programmatically checking and enforcing
  // style guide

  grunt.config.merge({
    jscs: {
      check: {
        src: ['src/**/*.js'],
        options: {
          config: '.jscsrc',
          // If you need output with rule names
          // http://jscs.info/overview.html#verbose
          verbose: true,
        },
      },

      fix: {
        src: ['src/**/*.js'],
        options: {
          config: '.jscsrc',
          fix: true,
          // If you need output with rule names
          // http://jscs.info/overview.html#verbose
          verbose: true,
        },
      },
    },
  });

  // Lint lints everything.

  grunt.registerTask('lint', ['jscs:check', 'eslint']);

  // Mocha runs browser-based tests.
  // --grep only runs tests matching a regular expression.
  // --bail stops testing on any failure.

  grunt.config.merge({
    mochaTest: {
      selenium: {
        src: ['./tests/selenium/*.js'],
        options: {
          bail: grunt.option('bail'),
          grep: grunt.option('grep'),
          slow: 5000,
        },
      },
    },
    mochify: {
      unit: {
        src: ['./tests/unit/*.js'],
        options: {
          reporter: 'spec',
          transform: ['ejsify'],
        },
      },
    },
  });

  // Test tests everything.

  grunt.registerTask('test', ['test:unit', 'test:selenium']);
  grunt.registerTask('test:selenium', ['mochaTest:selenium']);
  grunt.registerTask('test:unit', ['mochify:unit']);
};
