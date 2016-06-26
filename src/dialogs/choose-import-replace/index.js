// This asks a user to confirm that they want to replace existing stories with
// stories about to be imported. It's meant to be used by `file/import`.

const Vue = require('vue');
const locale = require('../../locale');
const { thenable } = require('../../vue/mixins/thenable');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		names: [],
		toReplace: []
	}),

	computed: {
		confirmLabel() {
			if (this.toReplace.length === 0) {
				return locale.say('Don\'t Replace Any Stories');
			}

			return locale.sayPlural(
				'Replace %d Story',
				'Replace %d Stories',
				this.toReplace.length
			);
		},

		confirmClass() {
			if (this.toReplace.length === 0) {
				return 'primary';
			}

			return 'danger';
		}
	},

	methods: {
		accept() {
			this.$broadcast('close', this.toReplace);
		},

		cancel() {
			this.$broadcast('reject', 'User cancelled importing');
		}
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog')
	},

	mixins: [thenable]
});
