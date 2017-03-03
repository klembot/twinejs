/* https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent */
/* eslint-disable */

(function(window) {
	try {
		new CustomEvent('test');
	} catch (e) {
		return false; // No need to polyfill
	}

	// Polyfills DOM4 CustomEvent
	function MouseEvent(eventType, params) {
		params = params || { bubbles: false, cancelable: false };
		var mouseEvent = document.createEvent('MouseEvent');

		mouseEvent.initMouseEvent(eventType, params.bubbles, params.cancelable, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

		return mouseEvent;
	}

	MouseEvent.prototype = Event.prototype;

	window.MouseEvent = MouseEvent;
})(window);

/* eslint-enable */
