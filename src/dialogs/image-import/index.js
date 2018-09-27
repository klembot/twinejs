/*
A dialog which allows a user to import an image from a file. This returns a
promise resolving to the image that was imported, as a data URI.
*/

const Vue = require('vue');
const locale = require('../../locale');
const { thenable } = require('../../vue/mixins/thenable');
const { updatePassage } = require('../../data/actions/passage');

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

		// Where to insert the image
		story: '',

		// The Vue component that can receive the passage-create event
		dispatchTo: null,
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
				// This does not return anything useful, but appears to execute synchronously.
				// https://v1.vuejs.org/api/#vm-dispatch
				// It has to be called on an object whose chain of `parent`s includes story-edit-view, where the handler is defined
				// After execution, a new passage has been appended to `this.story.passages`
				this.dispatchTo.$dispatch('passage-create');

				// The new passage is always the last one in the list:
				const newPassage = this.story.passages[this.story.passages.length-1];

				// It's not enough to directly modify the passage object -- changes won't persist.
				// We have to call updatePassage() to make permanent changes.
				this.updatePassage(
					this.story.id,
					newPassage.id,
					// In a perfect world, we would query the story format for how to embed an image.
					// In practice, all the standard formats seem to use the same HTML syntax for images.
					{ text: '<img src="'+source+'">', name: file.name, tags: ['image'] }
				);

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
			updatePassage
		},

		getters: {
			existingStories: state => state.story.stories
		}
	}
});
