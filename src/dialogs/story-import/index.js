/*
A dialog which allows a user to import a story from a file. This returns a
promise resolving to the stories that were imported, if any.
*/

const Vue = require('vue');
const { deleteStory, importStory } = require('../../data/actions/story');
const importHTML = require('../../data/import');
const load = require('../../file/load');
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
		   * `choosing`: choosing which stories to import, when there are
		     duplicates
		*/
		status: 'waiting',

		/* An array of objects to import. */

		toImport: [],

		/*
		An array of story names that already exist, and will be replaced in the
		import.
		*/

		dupeNames: [],

		/* The names that the user has selected to replace. */

		toReplace: []
	}),

	computed: {
		confirmClass() {
			if (this.toReplace.length === 0) {
				return 'primary';
			}

			return 'danger';
		},

		confirmLabel() {
			if (this.toReplace.length === 0) {
				return locale.say('Don\'t Replace Any Stories');
			}

			return locale.sayPlural(
				'Replace %d Story',
				'Replace %d Stories',
				this.toReplace.length
			);
		}
	},
	
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

			load(file)
			.then(source => {
				this.toImport = importHTML(source);

				this.dupeNames = this.toImport.reduce(
					(list, story) => {
						if (this.existingStories.find(
							orig => orig.name === story.name
						)) {
							list.push(story.name);
						}

						return list;
					},

					[]
				);

				if (this.dupeNames.length > 0) {
					/* Ask the user to pick which ones to replace, if any. */

					this.status = 'choosing';
				}
				else {
					/* Immediately run the import and close the dialog. */

					this.toImport.forEach(story => this.importStory(story));
					this.close();
				}
			});
		},

		replaceAndImport() {
			this.toReplace.forEach(name => {
				this.deleteStory(
					this.existingStories.find(story => story.name === name).id
				);
			});

			this.toImport.forEach(story => {
				/*
				If the user *didn't* choose to replace this story, skip it.
				*/

				if (this.toReplace.indexOf(story.name) !== -1 ||
					!this.existingStories.find(story => story.name === name)) {
					this.importStory(story);
				}
				
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
			deleteStory,
			importStory
		},

		getters: {
			existingStories: state => state.story.stories
		}
	}
});
