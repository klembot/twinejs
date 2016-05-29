const Vue = require('vue');
const {thenable, symbols:{resolve}} = require('../../vue/mixins/thenable');
const { eventID, on, off } = require('../../vue/mixins/event-id');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({}),

	props: {
		class: '',
		canClose: {
			type: Function,
			required: false
		}
	},

	ready() {
		let body = document.querySelector('body');

		body.classList.add('modalOpen');
		on(body, `keyup.modal-dialog${this.$eventID}`, e => this.escapeCloser(e));

		// We have to listen manually to the end of the transition in order
		// to an emit an event when this occurs; it looks like Vue only
		// consults the top-level element to see when the transition is
		// complete.

		const dialog = this.$el.querySelector('.modalDialog');
		const notifier = () => {
			// This event is currently only listened to by
			// <code-mirror> child components.
			this.$broadcast('transition-entered');
			dialog.removeEventListener('transitionend', notifier);
		};

		this.$el.querySelector('.modalDialog').addEventListener(
			'transitionend',
			notifier
		);
	},

	destroyed() {
		let body = document.querySelector('body');

		body.classList.remove('modalOpen');
		off(body, `.modal-dialog${this.$eventID}`);
		this.$emit('destroyed');
	},

	methods: {
		close() {
			if (typeof this.canClose === 'function' && !this.canClose()) {
				return;
			}

			this.$emit('close');
		},

		escapeCloser(e) {
			if (e.keyCode === 27) {
				e.preventDefault();
				this.close();
			}
		}
	},

	events: {
		close(message) {
			this[resolve](message);
			this.$destroy(true);
		},
	},

	mixins: [thenable, eventID]
});
