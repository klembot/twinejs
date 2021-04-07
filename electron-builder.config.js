const pkg = require('./package.json');

module.exports = {
	directories: {
		output: 'dist/electron'
	},
	extraMetadata: {
		main: 'electron-build/main/src/electron/index.js'
	},
	files: ['electron-build/**/*', 'node_modules/**/*'],
	linux: {
		artifactName: `twine-${pkg.version}-linux-\${arch}.zip`,
		target: [{arch: ['ia32', 'x64'], target: 'zip'}]
	},
	mac: {
		artifactName: `twine-${pkg.version}-macos.dmg`,
		icon: 'icons/app.icns',
		target: 'dmg'
	},
	nsis: {
		oneClick: false,
		allowToChangeInstallationDirectory: true
	},
	win: {
		artifactName: `twine-${pkg.version}-windows.exe`,
		icon: 'icons/app.ico',
		target: 'nsis'
	}
};
