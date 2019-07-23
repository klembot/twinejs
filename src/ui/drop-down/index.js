// A component which wraps a dropdown menu. This must be a direct child of the
// button used to trigger the menu.

const Drop = require('tether-drop');
const Vue = require('vue');
const eventHub = require('../../common/eventHub');
const { hasPrimaryTouchUI } = require('../index');
const domEvents = require('../../vue/mixins/dom-events');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		className: {
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
		},
		targetOffset: {
			type: String
		}
	},

	mounted() {
		this.$nextTick(function () {
			// code that assumes this.$el is in-document

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

			let tetherOptions = {
				constraints: [
					{
						to: 'window',
						pin: true
					}
				]
			};

			if (this.targetOffset) {
				tetherOptions.targetOffset = this.targetOffset;
			}

			this.$drop = new Drop({
				target,
				content: this.$el,
				position: this.position,
				openOn: openOn,
				classes: this.className,
				constrainToWindow: false,
				constrainToScrollParent: false,
				tetherOptions
			});

			/*
			Emit events as the drop opens and closes. See below for how other
			components can signal to us to close or reposition the drop.
			*/

			this.$drop.on('open', () => {
				eventHub.$emit('drop-down-opened', this);
				this.$emit('drop-down-opened', this);
			});

			this.$drop.on('close', () => {
				eventHub.$emit('drop-down-closed', this);
				this.$emit('drop-down-closed', this);
			});

			/*
			Close the dropdown when one of its menu items is clicked, unless any
			element in the chain has a data-drop-down-stay-open attribute.
			*/

			this.$drop.drop.addEventListener('click', e => {
				let target = e.target;

				do {
					if (target.getAttribute('data-drop-down-stay-open')) {
						return;
					}

					target = target.parentNode;
				} while (target.getAttribute);

				this.$drop.close();
			});

			if (this.showNow) {
				this.$drop.open();
			}
		});
	},

	destroyed() {
		this.$drop.destroy();
	},

	created: function() {
		eventHub.$on('drop-down-close', () => this.$drop.close());

		eventHub.$on('drop-down-reposition', () => this.$drop.position());
	},

	mixins: [domEvents]
});
