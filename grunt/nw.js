var chmodr = require('chmodr');

module.exports = function(grunt) {
	/* nwjs generates NW.js apps. */
	
	var options = {
		buildDir: 'build/nwjs/',
		cacheDir: 'nwbuilder-cache/',
		version: '0.17.4',
		macIcns: 'src/common/img/logo.icns',
		winIco: 'src/common/img/logo.ico'
	}

	grunt.config.merge({
		nwjs: {
			osx: {
				src: 'build/standalone/**',
				options: Object.assign({}, options,{
					platforms: ['osx64'],
				})
			},
			win64: {
				src: 'build/standalone/**',
				options: Object.assign({}, options,{
					platforms: ['win64'],
				})
			},
			win32: {
				src: 'build/standalone/**',
				options: Object.assign({}, options,{
					platforms: ['win32'],
				})
			},
			linux: {
				src: 'build/standalone/**',
				options: Object.assign({}, options,{
					platforms: ['linux32', 'linux64'],
				})
			},
		}
	});

	/*
	nwjs:osxcleanup corrects a permissions problem on OS X versions of the
	NW.js app.
	*/

	grunt.registerTask('nwjs:osxcleanup', function() {
		chmodr.sync('build/nwjs/Twine/osx64/Twine.app', 0755);
	});

	/*
	nw builds NW.js apps from the contents of build/standalone.
	*/

	['osx','win','linux'].forEach(plat => {
		grunt.registerTask('nw:' + plat, ['build:release', 'nwjs:' + plat,
			plat == 'osx' ? 'nwjs:osxcleanup' : '']);
	});
	grunt.registerTask('nw', [
		'build:release',
		'nwjs:osx',
		'nwjs:osxcleanup',
		'nwjs:win64',
		'nwjs:win32',
		'nwjs:linux'
	]);
};
