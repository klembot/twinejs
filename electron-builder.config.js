const child_process = require('child_process');
const pkg = require('./package.json');

const isPreview =
	/alpha|beta|pre/.test(pkg.version) || process.env.FORCE_PREVIEW;

module.exports = {
	// This step was necessary to ad hoc sign the app. Otherwise, on Apple Silicon
	// you get repeated prompts for file access. This is commented out because we
	// are able to sign the app thanks to the Interactive Fiction Technology
	// Foundation, but originally figuring this problem out took forever, so the
	// code below might be helpful to others making builds.
	// The code below was cribbed from https://github.com/alacritty/alacritty/issues/5840.
	//
	// afterSign(context) {
	// 	if (context.packager.platform.name === 'mac') {
	// 		console.log('Ad hoc signing Mac app...');
	// 		child_process.execSync(
	// 			'codesign --force --deep --sign - dist/electron/mac-universal/Twine.app'
	// 		);
	// 	}
	// },
	directories: {
		output: 'dist/electron'
	},
	extraMetadata: {
		main: 'electron-build/main/src/electron/main-process/index.js'
	},
	files: ['electron-build/**/*', 'node_modules/**/*'],
	linux: {
		artifactName: `Twine-${pkg.version}-Linux-\${arch}.zip`,
		target: [{arch: ['arm64', 'ia32', 'x64'], target: 'zip'}]
	},
	mac: {
		artifactName: `Twine-${pkg.version}-macOS.dmg`,
		icon: `icons/app-${isPreview ? 'preview' : 'release'}.png`,
		target: {arch: ['universal'], target: 'dmg'}
	},
	nsis: {
		oneClick: false,
		allowToChangeInstallationDirectory: true
	},
	win: {
		artifactName: `Twine-${pkg.version}-Windows.exe`,
		icon: `icons/app-${isPreview ? 'preview' : 'release'}-no-padding.ico`,
		target: {arch: ['x64'], target: 'nsis'}
	}
};
