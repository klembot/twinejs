// A component which wraps a dropdown menu. This must be a direct child of the
// button used to trigger the menu.

const Drop = require('tether-drop');
const Vue = require('vue');
const { hasPrimaryTouchUI } = require('../index');
const domEvents = require('../../vue/mixins/dom-events');

require('./index.less');

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
		let openOn = this.openOn;
		const target = this.$el.parentNode;

		if (hasPrimaryTouchUI() && openOn === 'click') {
			/*
			FastClick interferes with Drop's native handling -- we have to
			handle it manually.
			*/

			openOn = null;
			this.on(this.$el.parentNode, 'click', () => this.$drop.open());

			this.on(document.body, 'click', e => {
				if (e.target !== this.$el.parentNode &&
					!target.contains(e.target)) {
					this.$drop.close();
				}
			});
		}

		this.$drop = new Drop({
			target: target,
			content: this.$el,
			position: this.position,
			openOn: openOn,
			classes: this.class,
			constrainToWindow: true,
			constrainToScrollParent: false,
			tetherOptions: {
				constraints: [
					{
						to: 'window',
						attachment: 'together',
						pin: true
					}
				]
			}
		});

		/*
		Close the dropdown when one of its menu items is clicked.
		*/

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
		'drop-down-close'() {
			this.$drop.close();
		},

		'drop-down-reposition'() {
			this.$drop.position();
		}
	},
	
	mixins: [domEvents]
});
