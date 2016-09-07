// A component which wraps a dropdown menu. This must be a direct child of the
// button used to trigger the menu.

const Drop = require('tether-drop');
const Vue = require('vue');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		class: {
			type: String,
			default: ''
		},
		position: {
			type: String,
			default: 'top center'
		},
		openOn: {
			type: String,
			default: 'click'
		},
		showNow: {
			type: Boolean,
			default: false
		}
	},

	ready() {
		this.$drop = new Drop({
			target: this.$el.parentNode,
			content: this.$el,
			position: this.position,
			openOn: this.openOn,
			classes: this.class,
			constrainToWindow: true,
			constrainToScrollParent: false,
		});

		// Close the dropdown when one of its menu items is clicked.
		this.$drop.drop.addEventListener('click', () => {
			this.$drop.close();
		});

		if (this.showNow) {
			this.$drop.open();
		}
	},

	destroyed() {
		this.$drop.destroy();
	},

	events: {
		'drop-down-reposition'() {
			this.$drop.position();
		}
	}
});
