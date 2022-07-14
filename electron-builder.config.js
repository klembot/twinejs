const pkg = require('./package.json');

const isPreview =
	/alpha|beta|pre/.test(pkg.version) || process.env.FORCE_PREVIEW;

module.exports = {
	directories: {
		output: 'dist/electron'
	},
	extraMetadata: {
		main: 'electron-build/main/src/electron/main-process/index.js'
	},
	files: ['electron-build/**/*', 'node_modules/**/*'],
	linux: {
		artifactName: `Twine ${pkg.version} (Linux \${arch}).zip`,
		target: [{arch: ['arm64', 'ia32', 'x64'], target: 'zip'}]
	},
	mac: {
		artifactName: `Twine ${pkg.version} (macOS).dmg`,
		icon: `icons/app-${isPreview ? 'preview' : 'release'}.png`,
		target: {arch: ['universal'], target: 'dmg'}
	},
	nsis: {
		oneClick: false,
		allowToChangeInstallationDirectory: true
	},
	win: {
		artifactName: `Twine ${pkg.version} (Windows).exe`,
		icon: `icons/app-${isPreview ? 'preview' : 'release'}.ico`,
		target: 'nsis'
	}
};
