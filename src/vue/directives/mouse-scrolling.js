// This directive adds behavior to a component so that when it's mounted, the
// user may scroll the document by holding down the middle button and dragging
// (or the space bar + left button)

const {default:{on,off}} = require('oui-dom-events');

module.exports = {
	addTo(Vue) {
		Vue.directive('mouse-scrolling', {
			bind() {
				const {body} = document;

				let scrollOrigin, mouseOrigin, scrolling, spaceHeld = false;

				function beginScrolling(e) {
					// We don't need to account for the window's scroll
					// position here, since we'll be changing it on the fly.

					mouseOrigin = [e.clientX, e.clientY];
					scrollOrigin = [window.scrollX, window.scrollY];
					scrolling = true;
					body.classList.add('mouseScrolling');
					e.preventDefault();
				}

				on(body,'keydown.mouse-scrolling', (e) => {
					if (e.which === 32) {
						if (!scrolling && !spaceHeld) { // Space bar
							spaceHeld = true;
							body.classList.add('mouseScrollReady');
						}
						// preventDefault() stops the page from scrolling
						// downward when the space bar is held by itself.
						e.preventDefault();
					}
				});

				on(body,'mousedown.mouse-scrolling', (e) => {
					if (e.which === 2 && !scrolling) { // Middle button
						beginScrolling(e);
					}
					if (e.which === 1 && spaceHeld) { // Left button
						if (!scrolling) {
							beginScrolling(e);
						}
					}
				});

				on(body,'mousemove.mouse-scrolling', (e) => {
					if (scrolling) {
						window.scrollTo(
							scrollOrigin[0] + mouseOrigin[0] - e.clientX,
							scrollOrigin[1] + mouseOrigin[1] - e.clientY
						);
					}
				});

				on(body,'keyup.mouse-scrolling', (e) => {
					if (e.which === 32 && spaceHeld) {
						scrolling = spaceHeld = false;
						body.classList.remove('mouseScrollReady', 'mouseScrolling');
						e.preventDefault();
					}
				});

				on(body,'mouseup.mouse-scrolling', (e) => {
					if ((e.which === 2 || e.which === 1) && scrolling) {
						scrolling = false;
						body.classList.remove('mouseScrolling');
						e.preventDefault();
					}
				});
			},

			unbind() {
				off(document.body,'.mouse-scrolling');
			},
		});
	}
};
