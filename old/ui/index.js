/*
Provides some basic setup for UI elements.
*/

import fastclick from 'fastclick';
import './index.less';

let inited = false;
let fastclickInstance;

/*
Performs one-time startup tasks, mainly setting up event listeners.
The heavy lifting is done in submodules or jQuery plugins living
in that module.
*/

export function init() {
	if (inited) {
		return;
	}

	inited = true;

	/*
	This API depends on whether we're using the CDN or the CommonJS module
	:(
	*/

	if (fastclick.attach !== undefined) {
		fastclickInstance = fastclick.attach(document.body);
	} else {
		fastclickInstance = fastclick(document.body);
	}
}

/*
Undoes all setup in init().
*/

export function destroy() {
	if (!inited) {
		return;
	}

	/* Disable FastClick. */

	fastclickInstance.destroy();
	inited = false;
}

/*
Returns whether the app is running in an iOS environment.
*/

export function oniOS() {
	return navigator.userAgent.match(/iPhone|iPad|iPod/i);
}

/*
Returns whether the app is running in Safari (either on iOS or MacOS).
*/

export function onSafari() {
	/* Chrome identifies itself as Safari. */

	return (
		navigator.userAgent.indexOf('Safari') != -1 &&
		navigator.userAgent.indexOf('Chrome') == -1
	);
}

/*
Checks to see if the app is running a browser whose main UI is
touch-based. This doesn't necessarily mean that the browser doesn't
support touch at all, just that we expect the user to be interacting
through touchonly.
*/

export function hasPrimaryTouchUI() {
	return /Android|iPod|iPad|iPhone|IEMobile/.test(window.navigator.userAgent);
}
