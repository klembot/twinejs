/*
Information about the app, e.g. version and name. This is read-only and is based
on metadata embedded in the HTML during the compilation process.
*/

export function state() {
	const htmlEl = document.querySelector('html');

	return {
		name: htmlEl.getAttribute('data-app-name'),
		version: htmlEl.getAttribute('data-version'),
		buildNumber: parseInt(htmlEl.getAttribute('data-build-number'))
	};
}

export default {state, namespaced: true};
