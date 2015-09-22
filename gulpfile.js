var _ = require('underscore');
var browserify = require('browserify');
var childProcess = require('child_process');
var concat = require('gulp-concat');
var csslint = require('gulp-csslint');
var del = require('del');
var doc = require('gulp-jsdoc');
var fs = require('fs');
var glob = require('glob');
var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var lazypipe = require('lazypipe');
var minifyify = require('minifyify');
var minifyCss = require('gulp-minify-css');
var minimist = require('minimist');
var mocha = require('gulp-mocha');
var moment = require('moment');
var nwBuilder = require('nw-builder');
var plumber = require('gulp-plumber');
var po2json = require('gulp-po2json');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');
var sourceStream = require('vinyl-source-stream');
var template = require('gulp-template');
var twine = require('./package.json');
var watchify = require('watchify');
var wrench = require('wrench');

var TIMESTAMP_FORMAT = 'YYYYMMDDHHmm';

// lint tasks check source files for problems.

gulp.task('lint:js', function()
{
	return gulp.src('./src/**/*.js')
	       .pipe(plumber())
	       .pipe(jshint({
				browserify: true,
				'-W032': true // Unnecessary semicolon
		   }))
		   .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('lint:css', function()
{
	return gulp.src('./src/**/*.css')
	       .pipe(plumber())
	       .pipe(csslint({
			    'adjoining-classes': false, // .class.class is OK
		   		'fallback-colors': false, // using hsla() is OK
				ids: false // using ids is OK
	       }))
		   .pipe(csslint.reporter());

});

gulp.task('lint', ['lint:js']);

// doc generates documentation under, appropriately, doc/.

gulp.task('doc', function()
{
	return gulp.src('./src/**/*.js')
	       .pipe(plumber())
	       .pipe(doc('doc/',
		   {
				path: 'ink-docstrap',
				theme: 'cerulean',
				systemName: twine.name + ' ' + twine.version
		   }));
});

// clean deletes everything under build/ and dist/.

gulp.task('clean', function (cb)
{
	del('build/', function()
	{
		del('dist/', cb);
	});
});

// js generates a single JS file from everything under src/, twine.js, via
// Browserify.

var browserifyBundler = browserify('src/index.js', {
	detectGlobals: false,
	debug: true,
	cache: {},
	packageCache: {}
})
.external('nw.gui')
.exclude('fs')
.transform('ejsify');

function runBrowserify (useCdn)
{
	gutil.log('Browserify running');
	return browserifyBundler.bundle()
	       .pipe(sourceStream('twine.js'))
	       .pipe(gulp.dest(useCdn ? 'build/cdn/' : 'build/standalone/'));
};

function runMinifyify (useCdn)
{
	browserifyBundler.plugin('minifyify', { map: 'twine.js.map', output: 'build/standalone/twine.js.map' })

	// we have to manually force some CodeMirror modules to be
	// ignored, as they have no global variable associated with them; 
	// we include them to get side effects to happen on CodeMirror.

	if (useCdn)
		browserifyBundler = browserifyBundler.ignore('codemirror/mode/css/css')
		.ignore('codemirror/mode/javascript/javascript')
		.ignore('codemirror/addon/display/placeholder')
		.ignore('codemirror/addon/hint/show-hint')
		.transform('browserify-shim');

	return runBrowserify(useCdn);
};

function runWatchify()
{
	browserifyBundler = watchify(browserifyBundler);
	browserifyBundler.on('update', runBrowserify);
	return runBrowserify();
};

gulp.task('js', function() { runBrowserify(false) });
gulp.task('js:release', function() { runMinifyify(false) });
gulp.task('js:cdn', function() { runMinifyify(true) });

// css creates a single, minified CSS file, twine.css, from all CSS files under
// src/.

var cssTransform = lazypipe()
   .pipe(plumber)
   .pipe(sourcemaps.init)
   .pipe(minifyCss, { rebase: false, sourceMap: true })
   .pipe(sourcemaps.write)
   .pipe(replace, /url\(['"]?\.\.\//g, 'url(') // manually rebase URLs
   .pipe(concat, 'twine.css');
	
gulp.task('css', function()
{
	// order matters here; our local code must be last

	return gulp.src(
		[
		 './node_modules/font-awesome/css/font-awesome.css',
		 './node_modules/codemirror/lib/codemirror.css',
		 './src/**/*.css',
		 './node_modules/codemirror/addon/hint/show-hint.css'
		])
	       .pipe(cssTransform())
		   .pipe(gulp.dest('build/standalone/'));
});

gulp.task('css:cdn', function()
{
	return gulp.src('./src/**/*.css')
	       .pipe(cssTransform())
		   .pipe(gulp.dest('build/cdn/'));
});

// html creates a html file, index.html, from src/index.ejs. It gets a few
// pieces of data related to the build process.

gulp.task('html', function()
{
	return gulp.src('./src/index.ejs')
	       .pipe(plumber())
		   .pipe(template(_.extend({
				buildNumber: moment().format(TIMESTAMP_FORMAT),
				cdn: false
		   }, twine)))
		   .pipe(rename('index.html'))
		   .pipe(gulp.dest('build/standalone'));
});

gulp.task('html:cdn', function()
{
	return gulp.src('./src/index.ejs')
	       .pipe(plumber())
		   .pipe(template(_.extend({
				buildNumber: moment().format(TIMESTAMP_FORMAT),
				cdn: true
		   }, twine)))
		   .pipe(rename('index.html'))
		   .pipe(gulp.dest('build/cdn'));
});

// img copies all image files under src/ to build/standalone/img, flattening
// the directory structure.

gulp.task('img', function()
{
	return gulp.src('./src/**/img/**/*.{ico,png,svg}')
	       .pipe(rename(function (path)
		   {
			   	// move into single directory

		   		path.dirname = './' + path.dirname.replace(/.*img\/?/g, '');
		   }))
	       .pipe(gulp.dest('build/standalone/img/'))
		   .pipe(gulp.dest('build/cdn/img/'));
});

// fonts copies all font files under src/ to build/standalone/fonts, flattening
// the directory structure.

gulp.task('fonts', function()
{
	return gulp.src(['./src/**/fonts/*', './node_modules/font-awesome/fonts/*'])
	       .pipe(rename(function (path)
		   {
			   	// move into single directory

		   		path.dirname = './';
		   }))
	       .pipe(gulp.dest('build/standalone/fonts/'))
		   .pipe(gulp.dest('build/cdn/fonts/'));
});

// storyformats copies all story formats as they exist under storyFormats/.

gulp.task('storyformats', function()
{
	return gulp.src('storyFormats/**')
	       .pipe(gulp.dest('build/standalone/storyFormats/'))
		   .pipe(gulp.dest('build/cdn/storyFormats/'));
});

// manifest copies package.json to build/standalone/.

gulp.task('manifest', function()
{
	return gulp.src('package.json')
	       .pipe(gulp.dest('build/standalone/'));
});

// pot creates src/locale/po/template.pot by scanning the application source.
// This requires that xgettext is available in the system.

gulp.task('pot', function (cb)
{
	// we use PHP mode with Underscore templates since it seems to be OK
	// with random HTML interspersed everywhere :)
	// only downside is we cannot use string concatenation

	var templates = glob.sync('src/**/ejs/*.ejs');
	childProcess.execSync('xgettext -L PHP -ks -ksp:1,2 -cL10n ' +
	                      '-o src/locale/po/template.pot ' + templates.join(' '));

	var js = glob.sync('src/**/*.js');
	childProcess.execSync('xgettext -j -L JavaScript -ksay -ksayPlural:1,2 -cL10n ' +
	                      '-o src/locale/po/template.pot ' + js.join(' '));
	cb();
});

// pojson creates JSON files from .po files under src/locale/po.

gulp.task('pojson', function()
{
	return gulp.src('src/locale/po/*.po')
	       .pipe(po2json({ format: 'jed1.x', domain: 'messages' }))
		   // \\/ => \/, because xgettext isn't handling backslashes in templates correctly
		   .pipe(replace(/\\\\\//g, '\\/'))
		   .pipe(replace(/^/, 'window.locale('))
		   .pipe(replace(/$/, ')'))
		   .pipe(rename(function (path)
		   {
	       	path.extname = '.js'
		   }))
		   .pipe(gulp.dest('build/standalone/locale/'))
		   .pipe(gulp.dest('build/cdn/locale/'));
});

// build runs all tasks needed to create dev build under build/.

gulp.task('build', ['html', 'js', 'css', 'img', 'fonts', 'storyformats', 'manifest', 'pojson']);
gulp.task('build:cdn', ['html:cdn', 'js:cdn', 'css:cdn', 'img', 'fonts', 'storyformats', 'manifest', 'pojson']);
gulp.task('build:release', ['html', 'js:release', 'css', 'img', 'fonts', 'storyformats', 'manifest', 'pojson']);

gulp.task('default', ['build']);
gulp.task('watch', function()
{
	gulp.watch('./src/**/*.css', ['css']);	
	gulp.watch('./src/**/img/**/*.{ico,png,svg}', ['img']);	
	gulp.watch(['./src/**/fonts/*', './node_modules/font-awesome/fonts/*'], ['fonts']);
	gulp.watch('src/locale/po/*.po', ['pojson']);
	gulp.watch('storyFormats/**', ['storyformats']);
	runWatchify();
});

// test runs tests on the standalone build.
// Add --bail to bail out at the first error, and --grep xxx to only run tests
// matching a regexp.

gulp.task('test', function()
{
	var args = minimist(process.argv.slice(2));

	return gulp.src('./tests/**/*.js')
	       .pipe(mocha({ bail: args.bail, grep: args.grep }));
});

// nw builds NW.js apps from the contents of build/standalone.

function buildApp (cb)
{
	var options =
	{
		files: 'build/standalone/**',
		buildDir: 'build/nwjs/',
		cacheDir: 'nwbuilder-cache/',
		version: '0.12.3',
		platforms: ['osx64', 'win64', 'linux'],
		'chromium-args': '--enable-threaded-compositing',
		macIcns: 'src/common/img/logo.icns',
		winIco: 'src/common/img/logo.ico'
	};

	new nwBuilder(options).build(function()
	{
		// fix OS X permission problem
		// https://bitbucket.org/klembot/twinejs/issues/172/executables-in-built-app-on-os-x-should

		wrench.chmodSyncRecursive('build/nwjs/Twine/osx64/Twine.app', 0755);

		// workaround for Wine issue as noted at
		// https://github.com/nwjs/nw-builder/issues/179

		options.platforms = ['win32'];	
		new nwBuilder(options).build(cb);
	});
};

gulp.task('nw', ['build'], buildApp);
gulp.task('nw:release', ['build:release'], buildApp);

// nsis builds NSIS install scripts for Windows using nsis/installer.ejs as a template.

gulp.task('nsis:32', function()
{
	return gulp.src('./nsis/installer.ejs')
	       .pipe(plumber())
		   .pipe(template(_.extend({
		   		arch: 'win32',
				startMenuFolder: 'Twine 2',
				regKey: 'Twine2'
		   }, twine)))
		   .pipe(rename('installer_32.nsi'))
		   .pipe(gulp.dest('nsis/'));
});

gulp.task('nsis:64', function()
{
	return gulp.src('./nsis/installer.ejs')
	       .pipe(plumber())
		   .pipe(template(_.extend({
		   		arch: 'win64',
				startMenuFolder: 'Twine 2',
				regKey: 'Twine2'
		   }, twine)))
		   .pipe(rename('installer_64.nsi'))
		   .pipe(gulp.dest('nsis/'));
});

gulp.task('nsis', ['nsis:32', 'nsis:64']);

// package tasks create downloadable files ready to be posted.

gulp.task('package:clean', function (cb)
{
	del.sync('dist/');

	if (! fs.existsSync('dist/'))
		fs.mkdirSync('dist/');

	cb();
});

gulp.task('package:version', ['package:clean'], function (cb)
{
	var props =
	{
		buildNumber: moment().format(TIMESTAMP_FORMAT),
		version: twine.version,
		url: 'http://twinery.org'
	};

	fs.writeFile('dist/2.json', JSON.stringify(props), {}, cb);
});

gulp.task('package:web', ['build:release', 'package:clean'], function (cb)
{
	var folderName = 'twine_' + twine.version;

	fs.renameSync('build/standalone', 'build/' + folderName);
	childProcess.execSync('zip -r ../dist/' + folderName + '.zip ' + folderName,
	                      { cwd: 'build/' });
	fs.renameSync('build/' + folderName, 'build/standalone');
	cb();
});

gulp.task('package:linux32', ['nw:release', 'package:clean'], function (cb)
{
	var folderName = 'twine_' + twine.version + '_linux32';

	fs.renameSync('build/nwjs/Twine/linux32', 'build/nwjs/Twine/' + folderName);
	childProcess.execSync('zip -r ../../../dist/' + folderName + '.zip ' + folderName,
	                      { cwd: 'build/nwjs/Twine' });
	fs.renameSync('build/nwjs/Twine/' + folderName, 'build/nwjs/Twine/linux32');
	cb();
});

gulp.task('package:linux64', ['nw:release', 'package:clean'], function (cb)
{
	var folderName = 'twine_' + twine.version + '_linux64';

	fs.renameSync('build/nwjs/Twine/linux64', 'build/nwjs/Twine/' + folderName);
	childProcess.execSync('zip -r ../../../dist/' + folderName + '.zip ' + folderName,
	                      { cwd: 'build/nwjs/Twine' });
	fs.renameSync('build/nwjs/Twine/' + folderName, 'build/nwjs/Twine/linux64');
	cb();
});

gulp.task('package:osx', ['nw:release', 'package:clean'], function (cb)
{
	var zipName = 'twine_' + twine.version + '_osx.zip';

	childProcess.execSync('zip -r ../../../../dist/' + zipName + ' Twine.app',
	                      { cwd: 'build/nwjs/Twine/osx64' });
	cb();
});

gulp.task('package:win32', ['nw:release', 'package:clean', 'nsis:32'], function (cb)
{
	childProcess.execSync('makensis nsis/installer_32.nsi');
	cb();
});

gulp.task('package:win64', ['nw:release', 'package:clean', 'nsis:64'], function (cb)
{
	childProcess.execSync('makensis nsis/installer_64.nsi');
	cb();
});

gulp.task('package', ['build:cdn', 'package:version', 'package:web', 'package:linux32', 'package:linux64', 'package:osx', 'package:win32', 'package:win64']);

