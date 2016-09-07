const Vue = require('vue');
const domEvents = require('../../vue/mixins/dom-events');
const { thenable, symbols: { reject, resolve } } =
	require('../../vue/mixins/thenable');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({}),

	props: {
		class: '',
		title: '',
		canClose: {
			type: Function,
			required: false
		}
	},

	ready() {
		let body = document.querySelector('body');

		body.classList.add('modalOpen');
		this.on(body, 'keyup', this.escapeCloser);

		// We have to listen manually to the end of the transition in order
		// to an emit an event when this occurs; it looks like Vue only
		// consults the top-level element to see when the transition is
		// complete.

		const dialog = this.$el.querySelector('.modal-dialog');
		const notifier = () => {
			// This event is currently only listened to by
			// <code-mirror> child components.
			this.$broadcast('transition-entered');
			dialog.removeEventListener('transitionend', notifier);
		};

		dialog.addEventListener('transitionend', notifier);
	},

	destroyed() {
		let body = document.querySelector('body');

		body.classList.remove('modalOpen');
		this.$emit('destroyed');
	},

	methods: {
		close(message) {
			if (typeof this.canClose === 'function' && !this.canClose()) {
				return;
			}

			this.$emit('close', message);
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

		reject(message) {
			this[reject](message);
			this.$destroy(true);
		}
	},

	mixins: [domEvents, thenable]
});
