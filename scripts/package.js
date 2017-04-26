/*
These expect that NW.js builds have already been made in dist/nw/.

FIXME: expects to be run from the top level of the project directory
*/

'use strict';
const childProcess = require('child_process');
const ejs = require('ejs');
const fs = require('fs');
const twine = require('../package.json');

/*
Creates dist/uploads if it doesn't already exist.
*/

function createDistDirectory() {
	if (!fs.existsSync('dist')) {
		fs.mkdirSync('dist');
	}

	if (!fs.existsSync('dist/uploads')) {
		fs.mkdirSync('dist/uploads');
	}
}

/*
Builds .nsi packages for installation on Windows with makensis, which must
be installed separately -- http://nsis.sourceforge.net/Main_Page.
*/

function buildWindowsInstallers() {
	let data = Object.assign(
		{
			arch: 'win32',
			startMenuFolder: 'Twine 2',
			regKey: 'Twine2'
		},
		twine
	);

	const installerTemplate = fs.readFileSync(
		'scripts/nsis-script.ejs',
		{ encoding: 'utf8' }
	);
	const win32Script = ejs.render(installerTemplate, data);
	const win64Script = ejs.render(
		installerTemplate,
		Object.assign({}, data, { arch: 'win64' })
	);

	fs.writeFileSync('win32.nsi', win32Script, { encoding: 'utf8' });
	fs.writeFileSync('win64.nsi', win64Script, { encoding: 'utf8' });

	childProcess.execSync('makensis win32.nsi');
	fs.unlinkSync('win32.nsi');
	console.log(`Wrote dist/uploads/twine_${twine.version}_win32.exe.`);

	childProcess.execSync('makensis win64.nsi');
	fs.unlinkSync('win64.nsi');
	console.log(`Wrote dist/uploads/twine_${twine.version}_win64.exe.`);
}

/*
Zips up the web build, which requires zip to be installed as a command-line tool.
*/

function buildWebArchive() {
	let folderName = 'twine_' + twine.version;

	fs.renameSync('dist/web', 'dist/' + folderName);
	childProcess.execSync(
		`zip -r uploads/${folderName}.zip ${folderName}`,
		{ cwd: 'dist/' }
	);
	fs.renameSync(`dist/${folderName}`, 'dist/web');
	console.log(`Wrote dist/uploads/${folderName}.zip.`);
}

/*
Zips up the Mac build, which requires zip to be installed as a command-line tool.
*/

function buildMacInstallers() {
	childProcess.execSync(
		`zip -r ../../../uploads/twine_${twine.version}_osx.zip Twine.app`,
		{ cwd: 'dist/nw/Twine/osx64' }
	);
	console.log(`Wrote dist/uploads/twine_${twine.version}_osx.zip.`);
}

/*
Zips up the Linux build, which requires zip to be installed as a command-line tool.
*/

function buildLinuxInstallers() {
	fs.renameSync('dist/nw/Twine/linux32', `dist/nw/Twine/twine_${twine.version}`);
	childProcess.execSync(
		`zip -r ../../uploads/twine_${twine.version}_linux32.zip twine_${twine.version}`,
		{ cwd: 'dist/nw/Twine/' }
	);
	fs.renameSync(`dist/nw/Twine/twine_${twine.version}`, 'dist/nw/Twine/linux32');
	console.log(`Wrote dist/uploads/twine_${twine.version}_linux32.zip.`);

	fs.renameSync('dist/nw/Twine/linux64', `dist/nw/Twine/twine_${twine.version}`);
	childProcess.execSync(
		`zip -r ../../uploads/twine_${twine.version}_linux64.zip twine_${twine.version}`,
		{ cwd: 'dist/nw/Twine' }
	);
	fs.renameSync(`dist/nw/Twine/twine_${twine.version}`, 'dist/nw/Twine/linux64');
	console.log(`Wrote dist/uploads/twine_${twine.version}_linux64.zip.`);
}

/*
Writes version information to a file that will be uploaded to
https://twinery.org/latestversion/2.json, which signals the app auto-updater to
notify the user.
*/

function buildVersionJSON() {
	fs.writeFileSync(
		'dist/uploads/2.json',
		JSON.stringify({
			buildNumber: require('./build-number'),
			version: twine.version,
			url: 'https://twinery.org'
		}),
		{ encoding: 'utf8' }
	);

	console.log('Wrote dist/uploads/2.json.');
}

createDistDirectory();
buildWebArchive();
buildWindowsInstallers();
buildMacInstallers();
buildLinuxInstallers();
buildVersionJSON();
console.log('Done.\n');
