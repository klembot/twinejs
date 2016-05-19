// Exports a directive that can be added to Vue that adds tooltips to elements
// in a component.

const Tooltip = require('tether-tooltip');

module.exports = {
	addTo(Vue) {
		Vue.directive('tooltip', {
			bind() {
				// This must be deferred because the tooltip module expects
				// the element to be added to the DOM at instantiation.

				const pos = this.expression;

				Vue.nextTick(() => {
					this.tooltip = new Tooltip({
						target: this.el,
						content: this.el.getAttribute('title'),
						position: (pos && pos !== '') ? pos : 'top center',
						openDelay: 1000
					});

					this.el.removeAttribute('title');
				});
			},

			unbind() {
				this.tooltip.destroy();
			}
		});
	}
};
