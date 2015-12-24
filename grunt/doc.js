var twine = require('../package.json');

module.exports = function (grunt)
{
	// groc generates documentation under doc/.

	grunt.config.merge({
		groc:
		{
			default:
			{
				src: ['src/**/*.js', 'README.md'],
				dest: 'doc/',
			}
		}
	});

	// doc runs all documentation-related tasks.

	grunt.registerTask('doc', ['groc']);
};
