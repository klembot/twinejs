var _ = require('underscore');
var twine = require('../package.json');

module.exports = function (grunt)
{
	// browserify generates a single JS file from everything under src/
	// to twine.js.

	grunt.config.merge({
		browserify:
		{
			default:
			{
				files:
				{
					'build/standalone/twine.js': 'src/index.js'
				},
				options:
				{
					browserifyOptions:
					{
						debug: true,
						detectGlobals: false
					},
					exclude: ['fs'],
					external: ['nw.gui'],
					transform: ['ejsify'],
					watch: true
				}
			},
			cdn:
			{
				files:
				{
					'build/cdn/twine.js': 'src/index.js'
				},
				options:
				{
					browserifyOptions:
					{
						debug: false
					},
					exclude: ['fs'],
					external: ['nw.gui'],
					ignore: ['codemirror/mode/css/css',
							 'codemirror/mode/javascript/javascript',
							 'codemirror/addon/display/placeholder',
							 'codemirror/addon/hint/show-hint'],
					transform: ['ejsify', 'uglifyify', 'browserify-shim']
				}
			},
			release:
			{
				files:
				{
					'build/standalone/twine.js': 'src/index.js'
				},
				options:
				{
					browserifyOptions:
					{
						debug: false,
						detectGlobals: false
					},
					exclude: ['fs'],
					external: ['nw.gui'],
					transform: ['ejsify', 'uglifyify']
				}
			},
		}
	});

	// copy moves resource files under build/.

	grunt.config.merge({
		copy:
		{
			fonts:
			{
				src: ['src/**/fonts/*', 'node_modules/font-awesome/fonts/*'],
				dest: 'build/standalone/fonts/',
				expand: true,
				flatten: true
			},
			fontsCdn:
			{
				src: ['src/**/fonts/*', 'node_modules/font-awesome/fonts/*'],
				dest: 'build/cdn/fonts/',
				expand: true,
				flatten: true
			},
			images:
			{
				src: 'src/**/img/**/*.{ico,png,svg}',
				dest: 'build/standalone/img/',
				expand: true,
				flatten: true
			},
			imagesCdn:
			{
				src: 'src/**/img/**/*.{ico,png,svg}',
				dest: 'build/cdn/img/',
				expand: true,
				flatten: true
			},
			manifest:
			{
				src: 'package.json',
				dest: 'build/standalone/'
			},
			storyformats:
			{
				src: 'storyFormats/**',
				dest: 'build/standalone/',
				expand: true,
				flatten: false
			},
			storyformatsCdn:
			{
				src: 'storyFormats/**',
				dest: 'build/cdn/',
				expand: true,
				flatten: false
			},
		}
	});

	// less creates a single CSS file, twine.css, from all LESS
	// files under src/.

	grunt.config.merge({
		less:
		{
			default:
			{
				files:
				{
					// order matters here, so we override properly

					'build/standalone/twine.css':
					[
						'node_modules/font-awesome/css/font-awesome.css',
						'node_modules/codemirror/lib/codemirror.css',
						'src/**/*.less',
						'node_modules/codemirror/addon/hint/show-hint.css'
					]
				},
				options:
				{
					plugins: [ new (require('less-plugin-autoprefix'))({ browsers: ['iOS 1-9', 'last 2 versions'] })],
					sourceMap: true,
					sourceMapFileInline: true
				}
			},
			cdn:
			{
				files:
				{
					'build/cdn/twine.css': './src/**/*.less'
				},
				options:
				{
					plugins: [ new (require('less-plugin-autoprefix'))({ browsers: ['iOS 1-9', 'last 2 versions'] })],
				}
			},
			release:
			{
				files:
				{
					// order matters here, so we override properly

					'build/standalone/twine.css':
					[
						'node_modules/font-awesome/css/font-awesome.css',
						'node_modules/codemirror/lib/codemirror.css',
						'src/**/*.less',
						'node_modules/codemirror/addon/hint/show-hint.css'
					]
				},
				options:
				{
					plugins: [ new (require('less-plugin-autoprefix'))({ browsers: ['iOS 1-9', 'last 2 versions'] })],
				}
			}
		}
	});

	// template creates an HTML file, index.html, by mixing properties
	// into src/index.ejs.

	grunt.config.merge({
		template:
		{
			default:
			{
				files:
				{
					'build/standalone/index.html': 'src/index.ejs'
				},
				options:
				{
					data: _.extend(
					{
						buildNumber: require('./buildNumber')(),
						cdn: false
					}, twine)
				}
			},
			cdn:
			{
				files:
				{
					'build/cdn/index.html': 'src/index.ejs'
				},
				options:
				{
					data: _.extend(
					{
						buildNumber: require('./buildNumber')(),
						cdn: true
					}, twine)
				}
			}
		}
	});

	// build tasks package everything up under build/standalone and build/cdn.

	grunt.registerTask('build', ['browserify:default', 'less:default', 'template:default',
	                             'copy:fonts', 'copy:images', 'copy:storyformats', 'po']);
	grunt.registerTask('build:cdn', ['browserify:cdn', 'less:cdn', 'template:cdn',
	                                 'copy:fontsCdn', 'copy:imagesCdn', 'copy:storyformatsCdn', 'po:cdn']);
	grunt.registerTask('build:release', ['browserify:release', 'less:release', 'template:default',
	                                     'copy:fonts', 'copy:images', 'copy:storyformats', 'copy:manifest', 'po']);
	grunt.registerTask('default', ['build']);

	// watch observes changes to files outside of the browserify process and
	// runs tasks on them as part of development.

	grunt.config.merge({
		watch:
		{
			css:
			{
				files: 'src/**/*.less',
				tasks: ['less']
			},
			fonts:
			{
				files: ['src/**/fonts/*'],
				tasks: ['copy:fonts']
			},
			html:
			{
				files: ['src/index.ejs'],
				tasks: ['template:default']
			},
			images:
			{
				files: ['src/**/img/**/*.{ico,png,svg}'],
				tasks: ['copy:images']
			},
			storyformats:
			{
				files: ['storyFormats/**'],
				tasks: ['copy:storyformats']
			},
			templates:
			{
				files: ['src/**/*.ejs'],
				tasks: ['browserify:default']
			},
		}
	});

	// dev spins up everything needed for live development work.

	grunt.registerTask('dev', ['browserify:default', 'watch']);
};
