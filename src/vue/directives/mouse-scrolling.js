// This directive adds behavior to a component so that when it's mounted, the
// user may scroll the document by holding down the space bar/middle button and dragging.

const {default:{on,off}} = require('oui-dom-events');

module.exports = {
	addTo(Vue) {
		Vue.directive('mouse-scrolling', {
			bind() {
				const {body} = document;

				let scrollOrigin, mouseOrigin, scrolling = false;

				function beginScrolling(e) {
					// We don't need to account for the window's scroll
					// position here, since we'll be changing it on the fly.

					mouseOrigin = [e.clientX, e.clientY];
					scrollOrigin = [window.scrollX, window.scrollY];
					scrolling = true;
					body.classList.add('mouseScrollReady');
					e.preventDefault();
				}

				on(body,'keydown.mouse-scrolling', (e) => {
					if (e.which === 32 && !scrolling) { // Space bar
						beginScrolling(e);
					}
				});

				on(body,'mousedown.mouse-scrolling', (e) => {
					if (e.which === 2 && !scrolling) { // Middle button
						beginScrolling(e);
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
					if (e.which === 32 && scrolling) {
						scrolling = false;
						body.classList.remove('mouseScrollReady');
						e.preventDefault();
					}
				});

				on(body,'mouseup.mouse-scrolling', (e) => {
					if (e.which === 2 && scrolling) {
						scrolling = false;
						body.classList.remove('mouseScrollReady');
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
