module.exports = function (grunt)
{
	// eslint checks JavaScript files for potential problems.

	grunt.config.merge({
		eslint:
		{
			target: ['src/**/*.js'],
			options:
			{
				configFile: 'eslint.json'
			}
		}
	});

	// lint lints everything.

	grunt.registerTask('lint', ['eslint']);

	// mocha runs browser-based tests.
	// --grep only runs tests matching a regular expression.
	// --bail stops testing on any failure.

	grunt.config.merge({
		mochaTest:
		{
			src: ['./tests/**/*.js'],
			options:
			{
				bail: grunt.option('bail'),
				grep: grunt.option('grep')
			}
		}
	});

	// test tests everything.

	grunt.registerTask('test', ['mochaTest']);
};
