import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import {nodePolyfills} from 'vite-plugin-node-polyfills';
import packageJson from './package.json';

export default defineConfig({
	base: './',
	build: {
		outDir: 'dist/web'
	},
	define: {
		// Make app name and version available to code.
		// https://stackoverflow.com/a/74860417/7569568
		'import.meta.env.APP_VERSION': JSON.stringify(packageJson.version),
		'import.meta.env.APP_NAME': JSON.stringify(packageJson.name)
	},
	plugins: [
		nodePolyfills(
			// We only need a `global` injected, for CodeMirror.
			{include: [], globals: {global: true}}
		),
		react()
	]
});
