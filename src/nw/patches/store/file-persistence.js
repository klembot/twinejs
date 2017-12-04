const StoryFile = require('../../story-file');
const debounce = require('lodash.debounce');

let enabled = true;
let previousStories;

/*
Debounced functions to save stories to disk, so we don't thrash the filesystem
as the user types into a passage editor, for example. We need to have a
debounced function for each story, because Lodash's debounce function
doesn't pay attention to parameters to a function.
*/

let debouncedSavers = {};

function saveStoryById(store, id) {
	if (!id) {
		throw new Error('No id specified to save story');
	}

	if (!debouncedSavers[id]) {
		debouncedSavers[id] = debounce(
			(function(store) {
				StoryFile.save(
					store.state.story.stories.find(story => story.id === this),
					store.state.appInfo
				);
			}).bind(id),
			{ wait: 10000, leading: true, trailing: true }
		);
	}

	debouncedSavers[id](store);
}

module.exports = store => {
	previousStories = store.state.story.stories;

	store.subscribe((mutation, state) => {
		if (!enabled) {
			return;
		}

		switch (mutation.type) {
			/*
			When a story is created or imported, we have to find the new one by
			name.
			*/

			case 'CREATE_STORY':
			case 'IMPORT_STORY':
				saveStoryById(store, mutation.payload[0].id);
				break;

			case 'DELETE_STORY':
				StoryFile.delete(previousStories.find(
					story => story.id === mutation.payload[0]
				));
				break;

			/*
			These mutations take a story ID as their first argument, and simply
			reflect a change in the story's state that needs saving.
			*/

			case 'UPDATE_STORY':
			case 'CREATE_PASSAGE_IN_STORY':
			case 'UPDATE_PASSAGE_IN_STORY':
			case 'DELETE_PASSAGE_IN_STORY':
				/*
				Special case: if the user has changed the name of a story, we
				need to delete the old file first.
				*/

				if (mutation.type === 'UPDATE_STORY' && mutation.payload[1].name) {
					StoryFile.delete(
						previousStories.find(
							story => story.id === mutation.payload[0]
						),
						state.appInfo
					);
				}
				
				/* Save changes as normal. */

				saveStoryById(store, mutation.payload[0]);
				break;
		}

		/*
		We save a copy of the stories structure in aid of deleting, as above.
		*/
		
		previousStories = state.story.stories.map(
			s => Object.assign({}, s)
		);
	});
};
