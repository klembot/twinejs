const chmodr = require('chmodr');
const fs = require('fs');
const fsExtra = require('fs-extra');
const NwBuilder = require('nw-builder');

var argv = require('yargs').argv;

var platforms = argv.platform ? [argv.platform] :
	['osx64', 'win32', 'win64', 'linux32', 'linux64'];

fsExtra.copySync('package.json', 'dist/web/package.json');

var nw = new NwBuilder({
	files: 'dist/web/**',
	platforms: platforms,
	version: '0.25.4',
	buildDir: 'dist/nw',
	cacheDir: 'nw-cache/',
	macIcns: 'src/common/img/logo.icns',
	winIco: 'src/common/img/logo.ico'
});

nw.on('log', console.log);

nw.build().then(() => {
	chmodr.sync('dist/nw/Twine/osx64/Twine.app', 0755);
	fs.unlinkSync('dist/web/package.json');
});
