const pkg = require('./package.json');

const isPreview = /alpha|beta|pre/.test(pkg.version);

module.exports = {
	directories: {
		output: 'dist/electron'
	},
	extraMetadata: {
		main: 'electron-build/main/src/electron/main-process/index.js'
	},
	files: ['electron-build/**/*', 'node_modules/**/*'],
	linux: {
		artifactName: `twine-${pkg.version}-linux-\${arch}.zip`,
		target: [{arch: ['ia32', 'x64'], target: 'zip'}]
	},
	mac: {
		artifactName: `twine-${pkg.version}-macos.dmg`,
		icon: `icons/app-${isPreview ? 'preview' : 'release'}.png`,
		target: 'dmg'
	},
	nsis: {
		oneClick: false,
		allowToChangeInstallationDirectory: true
	},
	win: {
		artifactName: `twine-${pkg.version}-windows.exe`,
		icon: `icons/app-${isPreview ? 'preview' : 'release'}.ico`,
		target: 'nsis'
	}
};
