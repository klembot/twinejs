var gulp = require('gulp');
var _ = require('./lib/underscore.js');
var childProcess = require('child_process');
var del = require('del');
var fs = require('fs');
var twinePackage = require('./package.json');
var connect = require('gulp-connect');
var glob = require('glob');
var include = require('gulp-include');
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var lazypipe = require('lazypipe');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var moment = require('./lib/moment.js');
var nwBuilder = require('node-webkit-builder');
var plumber = require('gulp-plumber');
var po2json = require('gulp-po2json');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var runSequence = require('run-sequence');
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');
var yuidoc = require('gulp-yuidoc');

// the timestamp format (as passed to MomentJS)
// for build numbers

var TIMESTAMP_FORMAT = 'YYYYMMDDHHmm';

// CDN replacements for local resources

var CDN_LINKS =
[
	['lib/fontawesome/css/font-awesome.css',
	 '//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css'],

	['lib/jquery/jquery.js',
	 '//code.jquery.com/jquery-2.1.4.min.js'],
	
	['lib/jquery/jquery.powertip.js',
	 '//cdnjs.cloudflare.com/ajax/libs/jquery-powertip/1.2.0/jquery.powertip.min.js'],

	['lib/underscore.js',
	 '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js'],

	['lib/backbone/backbone.js',
	 '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.1/backbone-min.js'],

	['lib/backbone/backbone.localstorage.js',
	 '//cdnjs.cloudflare.com/ajax/libs/backbone-localstorage.js/1.1.16/backbone.localStorage-min.js'],

	['lib/backbone/backbone.marionette.js',
	 '//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.2/backbone.marionette.min.js'],

	['lib/codemirror/js/codemirror.js',
	 '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/codemirror.min.js'],
	
	['lib/codemirror/js/addon/display/placeholder.js',
	 '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/addon/display/placeholder.min.js'],

	['lib/codemirror/js/addon/hint/show-hint.js',
	 '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/addon/hint/show-hint.js'],
	
	['lib/codemirror/js/addon/hint/css-hint.js',
	 '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/addon/hint/css-hint.min.js'],
	
	['lib/codemirror/js/addon/hint/javascript-hint.js',
	 '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/addon/hint/javascript-hint.min.js'],
	
	['lib/codemirror/js/mode/css/css.js',
	 '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/mode/css/css.min.js'],

	['lib/codemirror/js/mode/javascript/javascript.js',
	 '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/mode/javascript/javascript.min.js'],

	['lib/fastclick.js',
	 '//cdnjs.cloudflare.com/ajax/libs/fastclick/1.0.6/fastclick.min.js'],
	
	['lib/jszip.js',
	 '//cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js'],
	
	['lib/moment.js',
	 '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.3/moment-with-locales.min.js'],
	
	['lib/svg.js',
	 '//cdnjs.cloudflare.com/ajax/libs/svg.js/1.0.1/svg.min.js']
];

// Options passed to node-web-builder

var NWBUILDER_OPTS =
{
	files: 'dist/web/**',
	buildDir: 'dist/nwjs/',
	version: '0.12.2',
	platforms: ['osx64', 'win', 'linux'],
	'chromium-args': '--enable-threaded-compositing',
	macIcns: 'img/logo.icns',
	winIco: 'img/logo.ico'
};

// Options passed to jshint

var JSHINT_OPTS =
{
	globals:
	{
		// Libraries
		$: true,
		_: true,
		moment: true,
		Backbone: true,
		FastClick: true,
		Jed: true,
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
		LocaleView: true,
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

// baking expands all import statements and
// stamps a build number into the HTML

gulp.task('bake', function()
{
	return gulp.src('./app.html')
	       .pipe(plumber())
		   .pipe(include())
		   .pipe(rename('index.html'))
		   .pipe(replace('{{build_number}}', moment().format(TIMESTAMP_FORMAT)))
		   .pipe(gulp.dest('./'));
});

// usemin minifies groups of references to CSS and JS
// into a single file, rewriting HTML accordingly
// for now, it appears we can't run usemin:web and usemin:web-cdn
// simultaneously -- perhaps because they're both reading from index.html?

var useminTasks = lazypipe()
   .pipe(plumber)
   .pipe(replace, '"img/favicon.ico"', '"rsrc/img/favicon.ico"')
   .pipe(replace, '"img/flags/', '"rsrc/img/flags/')
   .pipe(usemin,
   {
	css: [minifyCss(), 'concat'],
	css_cdn: [minifyCss(), 'concat'],
	html: [minifyHtml({ empty: true })],
	js: [uglify()],
	js_cdn: [uglify()],
   });

gulp.task('usemin:web', ['bake'], function()
{
	del.sync('dist/web/rsrc/js/**');
	del.sync('dist/web/rsrc/css/**');

	return gulp.src('index.html')
	       .pipe(useminTasks())
		   .pipe(gulp.dest('dist/web'));
});

gulp.task('usemin:web-cdn', ['bake'], function()
{
	del.sync('dist/web-cdn/rsrc/js/**');
	del.sync('dist/web-cdn/rsrc/css/**');

	var p = gulp.src('index.html')
	        .pipe(replace(/build:(css|js)_cdn/g, 'nobuild'));

	for (var i = 0; i < CDN_LINKS.length; i++)
		p = p.pipe(replace(CDN_LINKS[i][0], CDN_LINKS[i][1]));

	return p.pipe(useminTasks())
		   .pipe(gulp.dest('dist/web-cdn'));
});

// copy tasks move resources into distribution directories

gulp.task('copy:fonts', function()
{
	del.sync('dist/web/rsrc/fonts');
	del.sync('dist/web-cdn/rsrc/fonts');
	return gulp.src(['fonts/**', 'lib/fontawesome/fonts/**'])
	       .pipe(gulp.dest('dist/web/rsrc/fonts/'))
	       .pipe(gulp.dest('dist/web-cdn/rsrc/fonts/'));
});

gulp.task('copy:images', function()
{
	del.sync('dist/web/rsrc/img');
	del.sync('dist/web-cdn/rsrc/img');
	return gulp.src('img/**')
	       .pipe(gulp.dest('dist/web/rsrc/img/'))
	       .pipe(gulp.dest('dist/web-cdn/rsrc/img/'));
});

gulp.task('copy:license', function()
{
	return gulp.src('LICENSE')
	       .pipe(gulp.dest('dist/web/'))
	       .pipe(gulp.dest('dist/web-cdn/'));
});

gulp.task('copy:formats', function()
{
	del.sync('dist/web/storyformats');
	del.sync('dist/web-cdn/storyformats');
	return gulp.src('storyFormats/**')
	       .pipe(gulp.dest('dist/web/storyformats/'))
	       .pipe(gulp.dest('dist/web-cdn/storyformats/'));
});

gulp.task('copy:locale', function()
{
	del.sync('dist/web/locale');
	del.sync('dist/web-cdn/locale');
	return gulp.src('locale/*.js')
	       .pipe(gulp.dest('dist/web/locale/'))
	       .pipe(gulp.dest('dist/web-cdn/locale/'));
});

gulp.task('copy:package', function()
{
	return gulp.src('package.json')
	       .pipe(gulp.dest('dist/web/'));
});

gulp.task('copy', ['copy:fonts', 'copy:images', 'copy:formats', 'copy:locale', 'copy:license']);

// nw generates a NW.js app from dist/web

gulp.task('nw', ['release:web', 'copy:package'], function()
{
	del.sync('dist/nwjs');
	var nw = new nwBuilder(NWBUILDER_OPTS);
	return nw.build();
});

// nw-debug generates a non-minified version of the app,
// for tracing problems in the console

gulp.task('nw-debug', ['bake'], function()
{
	del.sync('dist/nwjs');
	var nw = new nwBuilder(_.extend(NWBUILDER_OPTS,
	{
		files: ['index.html', 'package.json', 'css/**', 'fonts/**',
		        'img/**', 'js/**', 'lib/**', 'locale/**', 'storyformats/**'],
		buildDir: 'dist/nwjs-debug/',
		platforms: ['osx64', 'win']
	}));

	return nw.build();
});

// release tasks handle minifying the app into various raw
// states, which are then packaged for download via the package tasks

gulp.task('release:version', function (cb)
{
	if (! fs.existsSync('dist/'))
		fs.mkdirSync('dist/');

	var props =
	{
		buildNumber: moment().format(TIMESTAMP_FORMAT),
		version: twinePackage.version,
		url: 'http://twinery.org'
	};

	fs.writeFile('dist/2.json', JSON.stringify(props), {}, cb);
});

gulp.task('release:web', ['bake', 'usemin:web', 'copy', 'release:version']);
gulp.task('release:web-cdn', ['bake', 'usemin:web-cdn', 'copy']);
gulp.task('release:nw', ['release:version', 'release:web', 'nw']);
gulp.task('release', ['release:web', 'release:web-cdn', 'release:nw']);

// package tasks package the releases for download
// we assume both makensis and zip are available

gulp.task('package:clean', function (cb)
{
	del.sync('dist/download/');

	if (! fs.existsSync('dist/'))
		fs.mkdirSync('dist/');

	if (! fs.existsSync('dist/web/'))
		fs.mkdirSync('dist/web/');

	if (! fs.existsSync('dist/download/'))
		fs.mkdirSync('dist/download/');

	cb();
});

gulp.task('package:web', ['package:clean'], function (cb)
{
	var folderName = 'twine_' + twinePackage.version;

	fs.renameSync('dist/web', 'dist/' + folderName);
	childProcess.execSync('zip -r download/' + folderName + '.zip ' + folderName,
	                      { cwd: 'dist/' });
	fs.renameSync('dist/' + folderName, 'dist/web');
	cb();
});

gulp.task('package:win32', ['release:nw', 'package:clean'], function (cb)
{
	childProcess.execSync('makensis nsis/install32.nsi');
	cb();
});

gulp.task('package:win64', ['release:nw', 'package:clean'], function (cb)
{
	childProcess.execSync('makensis nsis/install64.nsi');
	cb();
});

gulp.task('package:osx', ['release:nw', 'package:clean'], function (cb)
{
	var zipName = 'twine_' + twinePackage.version + '_osx.zip';

	childProcess.execSync('zip -r ../../../download/' + zipName + ' Twine.app',
	                      { cwd: 'dist/nwjs/Twine/osx64' });
	cb();
});

gulp.task('package:linux32', ['release:nw', 'package:clean'], function (cb)
{
	var folderName = 'twine_' + twinePackage.version + '_linux32';

	fs.renameSync('dist/nwjs/Twine/linux32', 'dist/nwjs/Twine/' + folderName);
	childProcess.execSync('zip -r ../../download/' + folderName + '.zip ' + folderName,
	                      { cwd: 'dist/nwjs/Twine' });
	fs.renameSync('dist/nwjs/Twine/' + folderName, 'dist/nwjs/Twine/linux32');
	cb();
});

gulp.task('package:linux64', ['release:nw', 'package:clean'], function (cb)
{
	var folderName = 'twine_' + twinePackage.version + '_linux64';

	fs.renameSync('dist/nwjs/Twine/linux64', 'dist/nwjs/Twine/' + folderName);
	childProcess.execSync('zip -r ../../download/' + folderName + '.zip ' + folderName,
	                      { cwd: 'dist/nwjs/Twine' });
	fs.renameSync('dist/nwjs/Twine/' + folderName, 'dist/nwjs/Twine/linux64');
	cb();
});

gulp.task('package', ['package:web', 'package:win32', 'package:win64', 'package:osx', 'package:linux32', 'package:linux64']);

// extracts text from JS and templates and creates a POT file

gulp.task('buildpot', function (cb)
{
	del.sync('locale/po/template.pot');

	// we use PHP mode with Underscore templates since it seems to be OK
	// with random HTML interspersed everywhere :)
	// only downside is we cannot use string concatenation

	var templates = glob.sync('templates/**/*.html');
	childProcess.execSync('xgettext -L PHP -ks -ksp:1,2 -cL10n ' +
	                      '-o locale/po/template.pot ' + templates.join(' '));

	var js = glob.sync('js/**/*.js');
	childProcess.execSync('xgettext -j -L JavaScript -ksay -ksayPlural:1,2 -cL10n ' +
	                      '-o locale/po/template.pot ' + js.join(' '));
	cb();
});

// builds JSONP files from PO files in the locale/po/ directory

gulp.task('buildpojson', function()
{
	return gulp.src('locale/po/*.po')
	       .pipe(po2json({ format: 'jed1.x', domain: 'messages' }))
		   // \\/ => \/, because xgettext isn't handling backslashes in templates correctly
		   .pipe(replace(/\\\\\//g, '\\/'))
		   .pipe(replace(/^/, 'window.locale('))
		   .pipe(replace(/$/, ')'))
		   .pipe(rename(function (path)
		   {
	       	path.extname = '.js'
		   }))
		   .pipe(gulp.dest('locale/'));
});

gulp.task('watch', function()
{
	gulp.watch(['app.html', 'templates/**'], ['bake', 'doc']);
	gulp.watch('js/**', ['jshint']);
});

gulp.task('default', ['jshint', 'bake', 'doc']);
