// Vuex actions that components can use.

const $ = require('jquery');
const linkParser = require('./link-parser');

const actions = module.exports = {
	setPref({ dispatch }, name, value) {
		dispatch('UPDATE_PREF', name, value);
	},

	createStory({ dispatch }, props) {
		dispatch('CREATE_STORY', props);
	},

	updateStory({ dispatch }, id, props) {
		dispatch('UPDATE_STORY', id, props);
	},

	deleteStory({ dispatch }, id) {
		dispatch('DELETE_STORY', id);
	},

	duplicateStory({ dispatch }, id, newName) {
		dispatch('DUPLICATE_STORY', id, newName);
	},

	importStory({ dispatch }, toImport) {
		dispatch('IMPORT_STORY', toImport);
	},

	createPassageInStory({ dispatch }, storyId, props) {
		dispatch('CREATE_PASSAGE_IN_STORY', storyId, props);
	},

	updatePassageInStory({ dispatch }, storyId, passageId, props) {
		dispatch('UPDATE_PASSAGE_IN_STORY', storyId, passageId, props);
	},

	deletePassageInStory({ dispatch }, storyId, passageId) {
		dispatch('DELETE_PASSAGE_IN_STORY', storyId, passageId);
	},

	// Adds new passages to a story based on new links added in a passage's
	// text.

	createNewlyLinkedPassages(store, storyId, passageId, oldText) {
		const story = store.state.story.stories.find(
			story => story.id === storyId
		);
		const passage = story.passages.find(
			passage => passage.id === passageId
		);

		// Determine how many passages we'll need to create.

		const oldLinks = linkParser(oldText, true);
		const newLinks = linkParser(passage.text, true).filter(
			link => (oldLinks.indexOf(link) === -1) &&
				!(story.passages.some(passage => passage.name === link))
		);

		// We center the new passages underneath this one.

		const newTop = passage.top + 100 * 1.5;

		// We account for the total width of the new passages as both the
		// width of the passages themselves plus the spacing in between.

		const totalWidth = newLinks.length * 100 +
			((newLinks.length - 1) * (100 / 2));
		let newLeft = passage.left + (100 - totalWidth) / 2;

		newLinks.forEach(link => {
			store.dispatch(
				'CREATE_PASSAGE_IN_STORY',
				storyId,
				{
					name: link,
					left: newLeft,
					top: newTop
				}
			);

			newLeft += 100 * 1.5;
		});
	},

	addFormat({ dispatch }, props) {
		dispatch('ADD_FORMAT', props);
	},

	updateFormat({ dispatch }, id, props) {
		dispatch('UPDATE_FORMAT', id, props);
	},

	deleteFormat({ dispatch }, id) {
		dispatch('DELETE_FORMAT', id);
	},

	loadFormat(store, name) {
		const format = store.state.storyFormat.formats.find(
			format => format.name === name
		);

		return new Promise((resolve, reject) => {
			if (format.loaded) {
				resolve(format);
				return;
			}

			$.ajax({
				url: format.url,
				dataType: 'jsonp',
				jsonpCallback: 'storyFormat',
				crossDomain: true
			})
			.done(props => {
				store.dispatch('LOAD_FORMAT', format.id, props);
				resolve(format);
			})
			.fail((req, status, error) => {
				reject(error);
			});
		});
	},

	// Repair paths to use kebab case, as in previous versions we used
	// camel case.

	repairFormats(store) {
		store.state.storyFormat.formats.forEach(format => {
			if (/^storyFormats\//i.test(format.url)) {
				actions.updateFormat(
					store,
					format.id,
					{
						url: format.url.replace(
							/^storyFormats\//i, 'story-formats/'
						)
					}
				);
			}
		});
	}
};
