/*
A dialog which allows a user to import an image from a file. This returns a
promise resolving to the image that was imported, as a data URI.
*/

const Vue = require('vue');
const locale = require('../../locale');
const { thenable } = require('../../vue/mixins/thenable');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		/* A file to immediately import when mounted. */
		immediateImport: null,

		/*
		Current state of the operation:
		   * `waiting`: waiting for the user to select a file
		   * `working`: working without user input
		*/
		status: 'waiting',
	}),

	ready() {
		if (this.immediateImport) {
			this.import(this.immediateImport);
		}
	},

	methods: {
		close() {
			if (this.$refs.modal) {
				this.$refs.modal.close();
			}
		},

		import(file) {
			this.status = 'working';

			const reader = new FileReader();

			// Copied from `file/load`.  Can't use that because it reads strings, not data URIs.
			new Promise(resolve => {
				reader.addEventListener('load', e => {
					resolve(e.target.result);
				});

				reader.readAsDataURL(file);
			})
			.then(source => {
				console.log("Imported "+source.length+" bytes, starting: "+source.substring(0, 40))
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
		},

		getters: {
			existingStories: state => state.story.stories
		}
	}
});
