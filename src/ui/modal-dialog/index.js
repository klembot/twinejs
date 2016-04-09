const Vue = require('vue');
const {thenable, symbols:{resolve}} = require('../../vue/mixins.js');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({}),

	props: {
		class: ''
	},

	ready() {
		let body = document.querySelector('body');

		body.classList.add('modalOpen');
		this.escapeCloser = this.escapeCloser.bind(this);
		body.addEventListener('keyup', this.escapeCloser);

		// We have to listen manually to the end of the transition in order
		// to an emit an event when this occurs; it looks like Vue only
		// consults the top-level element to see when the transition is
		// complete.

		const dialog = this.$el.querySelector('.modalDialog');
		const notifier = () => {
			// This event is currently only listened to by
			// <code-mirror> child components.
			this.$broadcast('transition-in');
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
		body.removeEventListener('keyup', this.escapeCloser);
	},

	methods: {
		close() {
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

	mixins: [thenable]
});
