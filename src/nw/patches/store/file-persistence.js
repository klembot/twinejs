const storyFile = require('../../story-file');

let enabled = true;
let previousStories;

module.exports = {
	onMutation(mutation, state, store) {
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
				storyFile.save(
					state.story.stories.find(
						story => story.id === mutation.payload[0]
					),
					state.appInfo
				);
			break;
		}

		/*
		We save a copy of the stories structure in aid of deleting, as above.
		*/
		
		previousStories = state.story.stories;
	}
};
