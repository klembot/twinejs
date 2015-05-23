var gulp = require('gulp');
var del = require('del');
var connect = require('gulp-connect');
var include = require('gulp-include');
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var nwBuilder = require('node-webkit-builder');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var runSequence = require('run-sequence');
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');
var XDate = require('./lib/xdate.js');
var yuidoc = require('gulp-yuidoc');

// the timestamp format (as passed to XDate)
// for build numbers

var TIMESTAMP_FORMAT = 'yyyyMMddHHmm';

// The directory releases will appear in.
// This gets changed by the release:cdn task.

var buildDir = 'dist/web';

// CDN replacements for local resources

var CDN_LINKS =
[
	['lib/fontawesome/css/font-awesome.css',
	 '//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css'],

	['lib/jquery/jquery.js',
	 '//code.jquery.com/jquery-2.1.4.min.js']
];

// Options passed to jshint

var JSHINT_OPTS =
{
	globals:
	{
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
		UUID: true,
		XDate: true,
		// Misc.
		app: true,
		global: true,
		nwui: true,
		process: true,
		require: true,
		ui: true,
		EventedLocalStorage: true,
		TransRegion: true,
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
};

gulp.task('clean', function (cb)
{
	del('dist/', cb);
});

gulp.task('jshint', function()
{
	return gulp.src('./js/**/*.js')
	       .pipe(plumber())
	       .pipe(jshint(JSHINT_OPTS))
		   .pipe(jshint.reporter(jshintStylish));
});

gulp.task('bake', function()
{
	var now = Date.now();

	del.sync('./index.html');
	del.sync(buildDir + '/index.html');

	return gulp.src('./app.html')
	       .pipe(plumber())
	       .pipe(include())
	       .pipe(replace('{{build_number}}', new XDate().toString(TIMESTAMP_FORMAT)))
	       .pipe(rename('index.html'))
	       .pipe(gulp.dest('./'))
		   .pipe(gulp.dest(buildDir));
});

gulp.task('injectcdn', ['bake'], function()
{
	var p = gulp.src('./index.html')
	        .pipe(replace(/build:(css|js)_cdn/g, 'build:disabled'))
		    .pipe(rename('index.html'))

	for (var i = 0; i < CDN_LINKS.length; i++)
		p = p.pipe(replace(CDN_LINKS[i][0], CDN_LINKS[i][1]));
		   
	return p.pipe(gulp.dest('./'));
});

gulp.task('usemin', ['bake'], function()
{
	del.sync(buildDir + '/rsrc/js/**');
	del.sync(buildDir + '/rsrc/css/**');

	return gulp.src('./index.html')
	       .pipe(plumber())
	       .pipe(usemin({
		   	css: [minifyCss(), 'concat'],
			css_cdn: [minifyCss(), 'concat'],
			html: [minifyHtml({ empty: true })],
			js: [uglify()],
			js_cdn: [uglify()],
		   }))
		   .pipe(gulp.dest(buildDir));
});

gulp.task('copy:fonts', function()
{
	del.sync(buildDir + '/rsrc/fonts');
	return gulp.src(['fonts/**', 'lib/fontawesome/fonts/**'])
	       .pipe(gulp.dest(buildDir + '/rsrc/fonts/'));
});

gulp.task('copy:images', function()
{
	del.sync(buildDir + '/rsrc/img');
	return gulp.src('img/**')
	       .pipe(gulp.dest(buildDir + '/rsrc/img/'));
});

gulp.task('copy:license', function()
{
	return gulp.src('LICENSE')
	       .pipe(gulp.dest(buildDir));
});

gulp.task('copy:formats', function()
{
	del.sync(buildDir + '/storyformats');
	return gulp.src('storyformats/**')
	       .pipe(gulp.dest(buildDir + '/storyformats/'));
});

gulp.task('copy:package', function()
{
	return gulp.src('package.json')
	       .pipe(gulp.dest(buildDir));
});

gulp.task('copy', ['copy:fonts', 'copy:images', 'copy:formats', 'copy:license']);

gulp.task('doc', function()
{
	del.sync('doc/');
	return gulp.src('js/**/*.js')
	       .pipe(plumber())
	       .pipe(yuidoc())
		   .pipe(gulp.dest('doc'));
});

gulp.task('server', function()
{
	connect.server({ port: 8000 });
});

gulp.task('nw', ['release:web', 'copy:package'], function()
{
	del.sync('dist/nwjs');

	var nw = new nwBuilder({
		files: 'dist/web/**',
		buildDir: 'dist/nwjs/',
		version: '0.12.1',
		platforms: ['osx64', 'win', 'linux'],
		'chromium-args': '--enable-threaded-compositing',
		macIcns: 'img/logo.icns',
		winIco: 'img/logo.ico'
	});

	return nw.build();
});

gulp.task('release:web', function (cb)
{
	buildDir = 'dist/web';
	runSequence('bake', 'usemin', 'copy', cb);
});

gulp.task('release:web-cdn', function (cb)
{
	buildDir = 'dist/web-cdn';
	runSequence('bake', 'injectcdn', 'usemin', 'copy', cb);
});

gulp.task('release:nw', ['release:web'], function (cb)
{
	buildDir = 'dist/nwjs';
	runSequence('nw', cb);
});

gulp.task('release', ['release:web', 'release:web-cdn', 'release:nw']);

gulp.task('watch', function()
{
	gulp.watch(['app.html', 'templates/**'], ['bake', 'doc']);
	gulp.watch('js/**', ['jshint']);
});

gulp.task('default', ['jshint', 'bake', 'doc']);
