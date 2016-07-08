// A dialog which allows a user to import a story from a file. This returns a
// promise resolving to the stories that were imported, if any.

const Vue = require('vue');
const { thenable, symbols: { resolve } } = require('../../vue/mixins/thenable');
const importHTML = require('../../data/import');
const { importStory } = require('../../data/actions');
const load = require('../../file/load');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		// Current state of the operation:
		//   * `waiting`: waiting for the user to select a file
		//   * `working`: working without user input
		//   * `choosing`: choosing which stories to import, when there are
		//     duplicates
		status: 'waiting',

		// An array of objects to import.

		toImport: Array
	}),

	methods: {
		close() {
			if (this.$refs.modal) {
				this.$refs.modal.close();
			}
		},

		import() {
			this.status = 'working';

			load(this.$els.importFile.files[0])
			.then(source => {
				let toImport = importHTML(source);

				// FIXME: handle duplicates

				toImport.forEach(story => this.importStory(story));
				this.close();
			});
		}
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog')
	},

	mixins: [thenable],

	vuex: {
		actions: {
			importStory
		}
	}
});
