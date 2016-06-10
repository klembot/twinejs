var wrench = require('wrench');

module.exports = function(grunt) {
	// nwjs generates NW.js apps.
	
	var options = {
		buildDir: 'build/nwjs/',
		cacheDir: 'nwbuilder-cache/',
		version: '0.12.3',
		platforms: ['osx64', 'linux'],
		'chromium-args': '--enable-threaded-compositing',
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
			win: {
				src: 'build/standalone/**',
				options: Object.assign({}, options,{
					platforms: ['win32','win64'],
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

	// nwjs:osxcleanup corrects a permissions problem on OS X versions of the NW.js app.

	grunt.registerTask('nwjs:osxcleanup', function() {
		wrench.chmodSyncRecursive('build/nwjs/Twine/osx64/Twine.app', 0755);
	});

	// nw builds NW.js apps from the contents of build/standalone.

	['osx','win','linux'].forEach(plat => {
		grunt.registerTask('nw:' + plat, ['build:release', 'nwjs:' + plat,
			plat == 'osx' ? 'nwjs:osxcleanup' : '']);
	});
	grunt.registerTask('nw:default', ['build:release', 'nwjs:osx', 'nwjs:win', 'nwjs:linux', 'nwjs:osxcleanup']);
};
