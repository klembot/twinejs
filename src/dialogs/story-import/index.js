// A dialog which allows a user to import a story from a file. This returns a
// promise resolving to the stories that were imported, if any.

const Vue = require('vue');
const fileImport = require('../../file/import');
const { thenable, symbols: { resolve } } = require('../../vue/mixins/thenable');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		working: false,
		importFile: '',
		storyCollection: null
	}),

	methods: {
		close() {
			if (this.$refs.modal) {
				this.$refs.modal.close();
			}
		},

		import() {
			this.working = true;
			fileImport.importFile(
				this.$els.importFile.files[0],
				{ confirmReplace: true, storyCollection: this.storyCollection }
			)
			.then(stories => {
				this.close();
				this[resolve](stories);	
			});
		}
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog')
	},

	mixins: [thenable]
});
