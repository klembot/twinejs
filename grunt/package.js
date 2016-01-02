var _ = require('underscore');
var childProcess = require('child_process');
var fs = require('fs');
var twine = require('../package.json');

module.exports = function(grunt) {
	// Template:nsis32 and template:nsis64 create NSIS scripts for each
	// architecture from a template.

	grunt.config.merge({
		template: {
			nsis32: {
				files: {
					'nsis/installer_32.nsi': 'nsis/installer.ejs'
				},
				options: {
					data: _.extend({
						arch: 'win32',
						startMenuFolder: 'Twine 2',
						regKey: 'Twine2'
					}, twine)
				}
			},
			nsis64: {
				files: {
					'nsis/installer_64.nsi': 'nsis/installer.ejs'
				},
				options: {
					data: _.extend({
						arch: 'win64',
						startMenuFolder: 'Twine 2',
						regKey: 'Twine2'
					}, twine)
				}
			}
		}
	});

	// Nsis run both scripts.

	grunt.registerTask('nsis', ['template:nsis32', 'template:nsis64']);

	// Package:version creates a file named 2.json with release information for
	// the current build, ready to be uploaded to
	// http://twinery.org/latestversion/.

	grunt.registerTask('package:version', function() {
		var props = {
			buildNumber: require('./buildNumber')(),
			version: twine.version,
			url: 'http://twinery.org'
		};

		grunt.file.write('dist/2.json', JSON.stringify(props));
	});

	// Package:web packages up the standalone build as a zip file.

	grunt.registerTask('package:web', function() {
		var folderName = 'twine_' + twine.version;

		if (! grunt.file.exists('dist/')) {
			grunt.file.mkdir('dist');
		}

		fs.renameSync('build/standalone', 'build/' + folderName);
		childProcess.execSync(
		'zip -r ../dist/' + folderName + '.zip ' + folderName,
		{cwd: 'build/'}
		);
		fs.renameSync('build/' + folderName, 'build/standalone');
	});

	// Package:linux32 packages up the Linux 32-bit NW.js version as a zip file.

	grunt.registerTask('package:linux32', function() {
		var folderName = 'twine_' + twine.version + '_linux32';

		if (! grunt.file.exists('dist/')) {
			grunt.file.mkdir('dist');
		}

		fs.renameSync('build/nwjs/Twine/linux32', 'build/nwjs/Twine/' + folderName);
		childProcess.execSync(
		'zip -r ../../../dist/' + folderName + '.zip ' + folderName,
		{cwd: 'build/nwjs/Twine'}
		);
		fs.renameSync('build/nwjs/Twine/' + folderName, 'build/nwjs/Twine/linux32');
	});

	// Package:linux64 packages up the Linux 32-bit NW.js version as a zip file.

	grunt.registerTask('package:linux64', function() {
		var folderName = 'twine_' + twine.version + '_linux64';

		if (! grunt.file.exists('dist/')) {
			grunt.file.mkdir('dist');
		}

		fs.renameSync('build/nwjs/Twine/linux64', 'build/nwjs/Twine/' + folderName);
		childProcess.execSync(
		'zip -r ../../../dist/' + folderName + '.zip ' + folderName,
		{cwd: 'build/nwjs/Twine'}
		);
		fs.renameSync('build/nwjs/Twine/' + folderName, 'build/nwjs/Twine/linux64');
	});

	// Package:osx packages up the OS X NW.js version as a zip file.

	grunt.registerTask('package:osx', function() {
		var zipName = 'twine_' + twine.version + '_osx.zip';

		if (! grunt.file.exists('dist/')) {
			grunt.file.mkdir('dist');
		}

		childProcess.execSync('zip -r ../../../../dist/' + zipName + ' Twine.app',
		{cwd: 'build/nwjs/Twine/osx64'});
	});

	// Package:win32 packages up the Windows 32-bit NW.js version as an installer.

	grunt.registerTask('package:win32', function() {
		if (! grunt.file.exists('dist/')) {
			grunt.file.mkdir('dist');
		}

		childProcess.execSync('makensis nsis/installer_32.nsi');
	});

	// Package:win32 packages up the Windows 32-bit NW.js version as an installer.

	grunt.registerTask('package:win64', function() {
		if (! grunt.file.exists('dist/')) {
			grunt.file.mkdir('dist');
		}

		childProcess.execSync('makensis nsis/installer_64.nsi');
	});

	// Packages packages everything under the sun.

	grunt.registerTask('package', ['build:release', 'build:cdn', 'nw', 'nsis',
	'package:version', 'package:web',
	'package:linux32', 'package:linux64',
	'package:osx', 'package:win32', 'package:win64']);
};
