/*
This directive adds behavior to a component so that when it's mounted, the user
may scroll the document by holding down the middle button and dragging (or the
space bar and left button).
*/

const ui = require('../../ui');
require('./mouse-scrolling.less');

module.exports = {
	addTo(Vue) {
		Vue.directive('mouse-scrolling', {
			bind() {
				const { body } = document;
				let scrollOrigin = false;
				let mouseOrigin = false;
				let scrolling = false;
				let spaceHeld = false;

				if (ui.hasPrimaryTouchUI()) {
					return;
				}

				function beginScrolling(e) {
					/*
					We don't need to account for the window's scroll position
					here, since we'll be changing it on the fly.
					*/

					mouseOrigin = [e.clientX, e.clientY];
					scrollOrigin = [window.scrollX, window.scrollY];
					scrolling = true;
					body.classList.add('mouseScrolling');
					e.preventDefault();
				}

				function handleKeyDown(e) {
					/* Space bar */

					if (e.which === 32) {
						if (!scrolling && !spaceHeld) {
							spaceHeld = true;
							body.classList.add('mouseScrollReady');
						}

						/*
						preventDefault() stops the page from scrolling downward
						when the space bar is held by itself. We need to take
						care to avoid gobbling up keystrokes for form elements.
						*/

						if (document.activeElement.nodeName !== 'INPUT' &&
							document.activeElement.nodeName !== 'TEXTAREA') {
							e.preventDefault();
						}
					}
				}

				function handleMouseDown(e) {
					if (e.which === 2 && !scrolling) { // Middle button
						beginScrolling(e);
					}

					if (e.which === 1 && spaceHeld) { // Left button
						if (!scrolling) {
							beginScrolling(e);
						}
					}
				}

				function handleMouseMove(e) {
					if (scrolling) {
						window.scrollTo(
							scrollOrigin[0] + mouseOrigin[0] - e.clientX,
							scrollOrigin[1] + mouseOrigin[1] - e.clientY
						);
					}
				}

				function handleKeyUp(e) {
					if (e.which === 32 && spaceHeld) {
						scrolling = spaceHeld = false;
						body.classList.remove('mouseScrollReady', 'mouseScrolling');

						/*
						Prevent the space bar from scrolling the window
						down. We have to make sure that by doing so, we
						don't accidentally gobble a keystroke meant for a
						form element.
						*/

						if (document.activeElement.nodeName !== 'INPUT' &&
							document.activeElement.nodeName !== 'TEXTAREA') {
							e.preventDefault();
						}
					}
				}

				function handleMouseUp(e) {
					if ((e.which === 2 || e.which === 1) && scrolling) {
						scrolling = false;
						body.classList.remove('mouseScrolling');
						e.preventDefault();
					}
				}

				body.addEventListener('mousedown', handleMouseDown);
				body.addEventListener('mousemove', handleMouseMove);
				body.addEventListener('mouseup', handleMouseUp);
				body.addEventListener('keydown', handleKeyUp);
				body.addEventListener('keyup', handleKeyUp);
			},

			unbind() {
				body.removeEventListener('mousedown', handleMouseDown);
				body.removeEventListener('mousemove', handleMouseMove);
				body.removeEventListener('mouseup', handleMouseUp);
				body.removeEventListener('keydown', handleKeyUp);
				body.removeEventListener('keyup', handleKeyUp);
			}
		});
	}
};
