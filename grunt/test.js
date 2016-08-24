module.exports = function(grunt) {
	// eslint checks JavaScript files for potential problems.

	grunt.config.merge({
		eslint: {
			target: ['src/**/*.js'],
			options: {
				configFile: 'eslint.json'
			}
		}
	});

	// jscs checks JavaScript files for style issues.

	grunt.config.merge({
		jscs: {
			check: {
				src: 'src/**/*.js',
				options: {
					config: '.jscsrc',
					maxErrors: -1
				}
			}
		}
	});

	// lint lints everything.

	grunt.registerTask('lint', ['eslint', 'jscs']);

	// mocha runs browser-based tests.
	// --grep only runs tests matching a regular expression.
	// --bail stops testing on any failure.

	grunt.config.merge({
		mochaTest: {
			selenium: {
				src: ['./tests/selenium/*.js'],
				options: {
					bail: grunt.option('bail'),
					grep: grunt.option('grep'),
					slow: 5000
				}
			}
		},
		mochify: {
			spec: {
				src: ['./src/**/*.spec.js'],
				options: {
					phantomjs: grunt.option('phantomjs') || 'phantomjs',
					reporter: 'dot',
					// This contrivance is required in order to force grunt-mochify to call
					// mochify with multiple --transform values (which it normally cannot).
					transform: 'stringify --transform [ babelify --presets babel-preset-es2015 ]'.split(' ')
				}
			}
		}
	});

	// test tests everything.

	grunt.registerTask('test', ['test:unit', 'test:selenium']);
	grunt.registerTask('test:selenium', ['mochaTest:selenium']);
	grunt.registerTask('test:unit', ['mochify:unit']);
};
