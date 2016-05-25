var wrench = require('wrench');

module.exports = function (grunt)
{
	// nwjs generates NW.js apps.
	
	grunt.config.merge({
		nwjs:
		{
			default:
			{
				src: 'build/standalone/**',
				options:
				{
					buildDir: 'build/nwjs/',
					cacheDir: 'nwbuilder-cache/',
					version: '0.12.3',
					platforms: ['osx64', 'win64', 'linux'],
					'chromium-args': '--enable-threaded-compositing',
					macIcns: 'src/common/img/logo.icns',
					winIco: 'src/common/img/logo.ico'
				}
			},
			
			// we have to run the Windows generation tasks separately;
			// otherwise, the process will randomly crash on OS X

			win32cleanup:
			{
				src: 'build/standalone/**',
				options:
				{
					buildDir: 'build/nwjs/',
					cacheDir: 'nwbuilder-cache/',
					version: '0.12.3',
					platforms: ['win32'],
					'chromium-args': '--enable-threaded-compositing',
					macIcns: 'src/common/img/logo.icns',
					winIco: 'src/common/img/logo.ico'
				}
			}
		}
	});

	// nwjs:osxcleanup corrects a permissions problem on OS X versions of the NW.js app.

	grunt.registerTask('nwjs:osxcleanup', function()
	{
		wrench.chmodSyncRecursive('build/nwjs/Twine/osx64/Twine.app', 0755);
	});

	// nw builds NW.js apps from the contents of build/standalone.

	grunt.registerTask('nw', ['build:release', 'nwjs:default', 'nwjs:win32cleanup', 'nwjs:osxcleanup']);
};
