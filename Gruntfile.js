module.exports = function (grunt)
{
	grunt.initConfig(
	{
		pkg: grunt.file.readJSON('package.json'),
		
		jshint: {
			all: ['js/**'],
			options: {
				globals: {
					// Libraries
					$: true,
					_: true,
					Backbone: true,
					FastClick: true,
					Marionette: true,
					CodeMirror: true,
					saveAs: true,
					SVG: true,
					JSZip: true,
					// Misc.
					app: true,
					ui: true,
					TwineRouter: true,
					// Collections
					AppPrefCollection: true,
					PassageCollection: true,
					StoryCollection: true,
					StoryFormatCollection: true,
					// Models
					AppPref: true,
					Passage: true,
					Story: true,
					StoryFormat: true,
					// Views
					PassageItemView: true,
					StoryItemView: true,
					StoryEditView: true,
					StoryListView: true,
					WelcomeView: true,
				},
				// Enforcing options
				immed    : true,
				latedef  : "nofunc", // Used a variable before its var statement
				noarg    : true, // Used arguments.caller
				nonew    : true, // Called 'new X()' but didn't assign the result to anything
				// Relaxing options
				globalstrict: true,
				laxbreak : true, // Used a line break before an operator, rather than after
				debug    : true, // Used console.log()
				funcscope: true, // Declared a var in a block, then used it outside the block
				"-W002"  : true, // Value of 'err' may be overwritten in IE8 and earlier
				"-W032"  : true, // Unnecessary semicolon
				"-W041"  : true, // Used != instead of !== in comparison with '' or 0
				"-W083"  : true, // Created a function while inside a for-loop
				// Environments
				browser  : true,
				devel    : true,
			}
		},
		
		bake:
		{
			options:
			{
				content:
				{
					build_number: grunt.template.today('yyyymmddhhMM')
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
							return '//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css';

						// jQuery

						if (url == 'lib/jquery/jquery.js')
							return '//code.jquery.com/jquery-1.11.0.min.js';
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

		connect:
		{
			server:
			{
				options: { keepalive: true }
			}
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
					{ expand: true, src: ['img/*.svg'], dest: 'dist/rsrc/' },
					{ expand: true, cwd: 'fonts', src: ['*'], dest: 'dist/rsrc/fonts/' },
					{ expand: true, cwd: 'storyformats', src: ['**'], dest: 'dist/storyformats' },
					{ expand: true, cwd: 'lib/fontawesome/fonts', src: ['*'], dest: 'dist/rsrc/fonts/' }
				]
			},

			license:
			{
				files:
				[
					{ expand: true, src: ['LICENSE'], dest: 'dist/' }
				]
			}
		},

		replace:
		{
			blockUseminCdn:
			{
				options:
				{
					patterns:
					[
						{
							match: /<!-- build.*_cdn.*?>/g,
							replacement: '<!-- cdn -->',
							expression: true
						}
					]
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
				files: ['app.html', 'templates/**/*.html', 'js/**'],
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
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-usemin');
	grunt.registerTask('default', ['bake']);
	grunt.registerTask('release',
	[
		'clean', 'jshint', 'bake', 'yuidoc', 'copy', 'useminPrepare', 'concat', 'uglify', 'cssmin', 'usemin'
	]);
	grunt.registerTask('release-cdn',
	[
		'clean', 'jshint', 'bake', 'replace:blockUseminCdn','cdnify', 'yuidoc', 'copy', 'useminPrepare', 'concat', 'uglify', 'cssmin', 'usemin'
	]);
	grunt.registerTask('release-test',
	[
		'bake', 'jshint', 'cdnify'
	]);
	grunt.registerTask('server', ['connect']);
};
