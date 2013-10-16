module.exports = function (grunt)
{
	grunt.initConfig(
	{
		pkg: grunt.file.readJSON('package.json'),

		bake:
		{
			options:
			{
				process: function (content, options)
				{
					// do really basic HTML entity replacement
					// to avoid breaking out of the data div
					// 0xe000 is the start of the Unicode private use range

					if (options.encode)
						return content.replace(/</g, '\ue000').replace(/>/g, '\ue001');
					else
						return content;
				}
			},

			build:
			{
				files: { 'test.html': 'app.html' }
			}
		},

		watch:
		{
			scripts:
			{
				files: ['app.html', 'templates/*.html'],
				tasks: ['default']
			}
		}
	});

	grunt.loadNpmTasks('grunt-bake');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', ['bake']);
};
