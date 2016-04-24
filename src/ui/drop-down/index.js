// A component which wraps a dropdown menu. This must be a direct child of the
// button used to trigger the menu.

const Drop = require('tether-drop');
const Vue = require('vue');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		position: {
			type: String,
			default: 'top center'
		},
		openOn: {
			type: String,
			default: 'click'
		}
	},

	compiled() {
		// Can't figure out why, but ready() is not firing for this.

		Vue.nextTick(() => {
			this.$drop = new Drop({
				target: this.$el.parentNode,
				content: this.$el,	
				position: this.position,
				openOn: this.openOn
			});

			this.$drop.drop.addEventListener('click', () => {
				this.$drop.close();
			});
		});
	},

	destroy() {
		this.$drop.destroy();
	}
});
