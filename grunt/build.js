var _ = require('underscore');
var twine = require('../package.json');
var autoprefix = require('less-plugin-autoprefix');
var cleanCss = require('less-plugin-clean-css');

// What browsers we intend to support.
// See https://github.com/postcss/autoprefixer#browsers for details.

var autoprefixBrowsers = ['iOS 1-9', 'last 2 versions'];

module.exports = function(grunt) {
	// browserify generates a single JS file from everything under src/
	// to twine.js.

	grunt.config.merge({
		browserify: {
			default: {
				files: {
					'build/standalone/twine.js': 'src/index.js'
				},
				options: {
					browserifyOptions: {
						debug: true
					},
					exclude: ['fs'],
					external: ['nw.gui'],
					transform: [
						'ejsify',
						'stringify',
						/* babelify is not used for test builds due to speed concerns. */
					],
					watch: true
				}
			},
			cdn: {
				files: {
					'build/cdn/twine.js': 'src/index.js'
				},
				options: {
					browserifyOptions: {
						debug: false
					},
					exclude: ['fs'],
					external: ['nw.gui'],
					ignore: [
						'codemirror/mode/css/css',
						'codemirror/mode/javascript/javascript',
						'codemirror/addon/display/placeholder',
						'codemirror/addon/hint/show-hint'
					],
					transform: [
						['envify', { NODE_ENV: 'production' }],
						'ejsify',
						'stringify',
						['babelify', { presets: ["es2015"] }],
						['uglifyify', { global: true }],
						'browserify-shim'
					]
				}
			},
			release: {
				files: {
					'build/standalone/twine.js': 'src/index.js'
				},
				options: {
					browserifyOptions: {
						debug: false
					},
					exclude: ['fs'],
					external: ['nw.gui', 'osenv'],
					transform: [
						['envify', { NODE_ENV: 'production' }],
						'ejsify',
						'stringify',
						['babelify', { presets: ['es2015'] }],
						['uglifyify', { global: true }]
					]
				}
			},
		}
	});

	// copy moves resource files under build/.

	grunt.config.merge({
		copy: {
			fonts: {
				src: ['src/**/fonts/*', 'node_modules/font-awesome/fonts/*'],
				dest: 'build/standalone/fonts/',
				expand: true,
				flatten: true
			},
			fontsCdn: {
				src: ['src/**/fonts/*', 'node_modules/font-awesome/fonts/*'],
				dest: 'build/cdn/fonts/',
				expand: true,
				flatten: true
			},
			images: {
				src: 'src/**/img/**/*.{ico,png,svg}',
				dest: 'build/standalone/img/',
				expand: true,
				flatten: true
			},
			imagesCdn: {
				src: 'src/**/img/**/*.{ico,png,svg}',
				dest: 'build/cdn/img/',
				expand: true,
				flatten: true
			},
			manifest: {
				src: 'package.json',
				dest: 'build/standalone/'
			},
			storyformats: {
				src: 'story-formats/**',
				dest: 'build/standalone/',
				expand: true,
				flatten: false
			},
			storyformatsCdn: {
				src: 'story-formats/**',
				dest: 'build/cdn/',
				expand: true,
				flatten: false
			}
		}
	});

	// less creates a single, minified CSS file, twine.css, from all CSS and LESS
	// files under src/.

	grunt.config.merge({
		less: {
			default: {
				files: {
					// order matters here, so we override properly

					'build/standalone/twine.css': [
						'node_modules/font-awesome/less/font-awesome.less',
						'node_modules/codemirror/lib/codemirror.css',
						'src/**/*.css',
						'src/**/*.less',
						'node_modules/codemirror/addon/hint/show-hint.css'
					]
				},
				options: {
					modifyVars: { "fa-font-path": "fonts" },
					plugins: [new autoprefix({ browsers: autoprefixBrowsers })],
					sourceMap: true
				}
			},
			cdn: {
				files: {
					'build/cdn/twine.css': [
						'./src/**/*.css',
						'./src/**/*.less'
					]
				},
				options: {
					plugins: [new autoprefix({ browsers: autoprefixBrowsers })],
				}
			},
			release: {
				files: {
					// order matters here, so we override properly

					'build/standalone/twine.css': [
						'node_modules/font-awesome/less/font-awesome.less',
						'node_modules/codemirror/lib/codemirror.css',
						'src/**/*.css',
						'src/**/*.less',
						'node_modules/codemirror/addon/hint/show-hint.css'
					]
				},
				options: {
					modifyVars: { "fa-font-path": "fonts" },
					plugins: [
						new autoprefix({ browsers: autoprefixBrowsers }),
						new cleanCss()
					],
				}
			}
		}
	});

	// template creates an HTML file, index.html, by mixing properties
	// into src/index.ejs.

	grunt.config.merge({
		template: {
			default: {
				files: {
					'build/standalone/index.html': 'src/index.ejs'
				},
				options: {
					data: _.extend(
						{
							buildNumber: require('./build-number')(),
							cdn: false
						},
						twine
					)
				}
			},
			cdn: {
				files: {
					'build/cdn/index.html': 'src/index.ejs'
				},
				options: {
					data: _.extend(
						{
							buildNumber: require('./build-number')(),
							cdn: true
						},
						twine
					)
				}
			}
		}
	});

	// build tasks package everything up under build/standalone and build/cdn.

	grunt.registerTask('build', [
		'browserify:default',
		'less:default',
		'template:default',
		'copy:fonts',
		'copy:images',
		'copy:storyformats', 
		'po'
	]);

	grunt.registerTask('build:cdn', [
		'browserify:cdn',
		'less:cdn',
		'template:cdn',
		'copy:fontsCdn',
		'copy:imagesCdn',
		'copy:storyformatsCdn',
		'po:cdn'
	]);

	grunt.registerTask('build:release', [
		'browserify:release',
		'less:release',
		'template:default',
		'copy:fonts',
		'copy:images',
		'copy:storyformats',
		'copy:manifest',
		'po'
	]);

	grunt.registerTask('default', ['build']);

	// watch observes changes to files outside of the browserify process and
	// runs tasks on them as part of development.

	grunt.config.merge({
		watch: {
			css: {
				files: ['src/**/*.css', 'src/**/*.less'],
				tasks: ['less']
			},
			fonts: {
				files: ['src/**/fonts/*'],
				tasks: ['copy:fonts']
			},
			html: {
				files: ['src/index.ejs'],
				tasks: ['template:default']
			},
			images: {
				files: ['src/**/img/**/*.{ico,png,svg}'],
				tasks: ['copy:images']
			},
			storyformats: {
				files: ['storyFormats/**'],
				tasks: ['copy:storyformats']
			}
		}
	});

	// dev spins up everything needed for live development work.

	grunt.registerTask('dev', ['browserify:default', 'watch']);
};
