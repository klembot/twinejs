// This directive adds behavior to a component so that when it's mounted, the
// user may scroll the document by holding down the space bar and dragging.

module.exports = {
	addTo(Vue) {
		Vue.directive('mouse-scrolling', {
			bind() {
				const body = document.querySelector('body');

				this.spaceDown = false;

				this.onKeyDown = window.addEventListener('keydown', (e) => {
					if (e.which === 32) {
						this.spaceDown = true;
						body.classList.add('mouseScrollReady');
					}
				});

				this.onKeyUp = window.addEventListener('keyup', (e) => {
					if (e.which === 32) {
						this.spaceDown = false;
						body.classList.remove('mouseScrollReady');
					}
				});

				// We need to capture this event to prevent it from being
				// interfered with by <marquee-selector>.

				this.onMouseDown = window.addEventListener('mousedown', (e) => {
					if (this.spaceDown && e.which === 1) {
						// We don't need to account for the window's scroll
						// position here, since we'll be changing it on the fly.

						this.mouseOrigin = [e.clientX, e.clientY];
						this.scrollOrigin = [window.scrollX, window.scrollY];
						window.addEventListener('mousemove', this.onMouseMove);
						window.addEventListener('mouseup', this.onMouseUp);
						e.stopImmediatePropagation();
					}
				}, { capture: true });
				
				this.onMouseMove = (e) => {
					window.scrollTo(
						this.scrollOrigin[0] + this.mouseOrigin[0] - e.clientX,
						this.scrollOrigin[1] + this.mouseOrigin[1] - e.clientY
					);
				};

				this.onMouseUp = (e) => {
					window.removeEventListener('mousemove', this.onMouseMove);
					window.removeEventListener('mouseup', this.onMouseUp);
					e.preventDefault();
				};
			},

			unbind() {
				window.removeEventListener('keydown', this.onKeyDown);
				window.removeEventListener('keyup', this.onKeyUp);
				window.removeEventListener('mousedown', this.onMouseDown);
				window.removeEventListener('mouseup', this.onMouseUp);
				window.removeEventListener('mosemove', this.onMouseMove);
			}
		});
	}
};
