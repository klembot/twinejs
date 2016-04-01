const Vue = require('vue');
// The jQuery dependency is solely to provide namespaced event management.
// Sadly, Vue's @keydown doesn't work for non-<input> elements.
const $ = require('jquery');
const {thenable, symbols:{resolve}} = require('../../common/vue-mixins.js');

module.exports = Vue.extend({
	data: () => ({}),
	props: {
		class: '',
	},
	template: require('./index.html'),
	created() {
		$('body').addClass('modalOpen')
			.on('keypress.modal-dialog', e => {
				if ((e.key + '').slice(0,3) === "Esc") {
					e.preventDefault();
					this.close();
				}
			});
	},
	destroyed() {
		$('body').removeClass('modalOpen').off('keypress.modal-dialog');
	},
	methods: {
		close() {
			this.$emit('close-dialog');
		},
	},
	events: {
		'close-dialog'(message) {
			this[resolve](message);
			this.$destroy(true);
		},
	},
	mixins: [thenable],
});
