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
					// insert build number
					var d = new Date();

					content = content.replace('{{build_number}}', grunt.template.today('yyyymmddhhMM'));

					// do really basic HTML entity replacement
					// to avoid breaking out of the <script> element
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

		cdnify:
		{
			all:
			{
				options:
				{
					rewriter: function (url)
					{
						// Bootstrap

						if (url.indexOf('lib/bootstrap') == 0)
							return url.replace('lib/bootstrap', '//netdna.bootstrapcdn.com/bootstrap/3.1.1/');

						// Font Awesome

						if (url == 'lib/fontawesome/css/font-awesome.css')
							return '//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.min.css';

						// jQuery

						if (url == 'lib/jquery/jquery.js')
							return '//code.jquery.com/jquery-1.9.1.min.js';

						if (url == 'lib/jquery/jquery.ui.js')
							return '//code.jquery.com/ui/1.10.2/jquery-ui.min.js';
					}
				},

				files:
				[{
					src: 'index.html',
					dest: 'index.html'
				}]
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
					{ expand: true, cwd: 'font', src: ['*'], dest: 'dist/rsrc/font/' },
					{ expand: true, cwd: 'lib/fontawesome/font', src: ['*'], dest: 'dist/rsrc/font/' }
				]
			}
		},

		replace:
		{
			dist:
			{
				options:
				{
					patterns:
					[{
						match: 'BUILD',
						replacement: 'hi'
						/*
						replacement: function()
						{
							var d = new Date();
							return d.getFullYear() + d.getMonth() + d.getDay() + d.getHours();
						}
						*/
					}]
				},
				
				files:
				[{
					src: 'index.html',
					dest: 'index.html'
				}]
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
				files: ['app.html', 'templates/*.html', 'js/**'],
				tasks: ['default']
			}
		},

		yuidoc:
		{
			compile:
			{
				name: '<%= pkg.name %>',
				description: '<%= pkg.description %>',
				version: '<%= pkg.version %>',
				url: '<%= pkg.homepage %>',
				options:
				{
					paths: 'js/',
					outdir: 'doc/'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-bake');
	grunt.loadNpmTasks('grunt-cdnify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-usemin');
	grunt.registerTask('default', ['bake']);
	grunt.registerTask('release',
	[
		'clean', 'bake', 'yuidoc', 'copy', 'useminPrepare', 'concat', 'uglify', 'cssmin', 'usemin'
	]);
	grunt.registerTask('release-cdn',
	[
		'clean', 'bake', 'cdnify', 'yuidoc', 'copy', 'useminPrepare', 'concat', 'uglify', 'cssmin', 'usemin'
	]);
};
