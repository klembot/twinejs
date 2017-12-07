const saveQueue = require('../../save-queue');
const storyFile = require('../../story-file');

let enabled = true;
let previousStories;

module.exports = store => {
	previousStories = store.state.story.stories;
	saveQueue.attachStore(store);

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
				storyFile.save(
					state.story.stories.find(
						story => story.name === mutation.payload[0].name
					),
					state.appInfo
				);
				break;

			case 'DELETE_STORY':
				storyFile.delete(previousStories.find(
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
					storyFile.delete(
						previousStories.find(
							story => story.id === mutation.payload[0]
						),
						state.appInfo
					);
				}
				
				/* Save changes as normal. */

				saveQueue.queue(mutation.payload[0]);
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
