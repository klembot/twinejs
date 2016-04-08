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
