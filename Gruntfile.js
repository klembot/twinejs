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
				files: { 'index.html': 'app.html' }
			}
		},

		clean:
		{
			dist: ['dist/']
		},

		copy:
		{
			html:
			{
				files:
				[
					{ expand: true, src: ['index.html'], dest: 'dist/' }
				]
			},

			resources:
			{
				files:
				[
					{ expand: true, src: ['img/*.png'], dest: 'dist/rsrc/' },
					{ expand: true, cwd: 'lib/fontawesome/font', src: ['*'], dest: 'dist/rsrc/font/' }
				]
			}
		},

		useminPrepare:
		{
			html: 'index.html',
			options: { dest: 'dist' }
		},

		usemin:
		{
			html: 'dist/index.html'
		},

		watch:
		{
			templates:
			{
				files: ['app.html', 'templates/*.html'],
				tasks: ['default']
			}
		}
	});

	grunt.loadNpmTasks('grunt-bake');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-usemin');
	grunt.registerTask('default', ['bake']);
	grunt.registerTask('release',
	[
		'clean', 'bake', 'copy', 'useminPrepare', 'concat', 'uglify', 'cssmin', 'usemin'
	]);
};
