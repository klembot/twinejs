var twine = require('../package.json');

module.exports = function (grunt)
{
	// jsdoc generates API documentation under doc/.

	grunt.config.merge({
		jsdoc:
		{
			default:
			{
				src: 'src/**/*.js',
				dest: 'doc/',
				options:
				{
					path: 'ink-docstrap',
					theme: 'cerulean',
					systemName: twine.name + ' ' + twine.version
				}
			}
		}
	});

	// doc runs all documentation-related tasks.

	grunt.registerTask('doc', ['jsdoc']);
};
