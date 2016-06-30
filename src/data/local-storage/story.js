// Functions for moving stories in and out of local storage. This module in
// particular needs to remain well-optimized, as it has a direct effect on load
// time.

let { createStory } = require('../actions');

module.exports = {
	// Saves an array of story objects to local storage.

	save(store, stories) {
		let storyIdList = window.localStorage.getItem('twine-stories');
		let passageIdList = window.localStorage.getItem('twine-passages');

		stories.forEach(story => {
			if (!storyIdList.indexOf(story.id)) {
				storyIdList += ',' + story.id;
			}

			// We have to remove the passages property before serializing the
			// story, as those are serialized under separate keys.

			window.localStorage.setItem(
				'twine-stories-' + story.id,
				JSON.stringify(
					Object.assign({}, story, { passages: undefined })
				)
			);

			story.passages.forEach(passage => {
				if (!passageIdList.indexOf(passage.id)) {
					passageIdList+= ',' + passage.id;
				}

				window.localStorage.setItem(
					'twine-passages-' + passage.id,
					JSON.stringify(passage)
				);
			});
		});

		// Clean up the lists of any leading or trailing commas.
		
		storyIdList = storyIdList.replace(/^,/, '').replace(/,$/, '');
		passageIdList = passageIdList.replace(/^,/, '').replace(/,$/, '');

		window.localStorage.setItem('twine-stories', storyIdList);
		window.localStorage.setItem('twine-passages', passageIdList);
	},

	// Removes stories from local storage, e.g. after being deleted from the
	// store.

	destroy(store, stories) {
		// FIXME
	},

	load(store) {
		let stories = {};

		// First, deserialize stories. We index them by id so that we can
		// quickly add passages to them as they are deserialized.

		window.localStorage.getItem('twine-stories').split(',').forEach(id => {
			let newStory = JSON.parse(
				window.localStorage.getItem('twine-stories-' + id)
			);

			newStory.passages = [];
			stories[newStory.id] = newStory;
		});

		// Then create passages, adding them to their parent story.

		window.localStorage.getItem('twine-passages').split(',').forEach(id => {
			let newPassage = JSON.parse(
				window.localStorage.getItem('twine-passages-' + id)
			);

			if (!newPassage || !newPassage.story) {
				console.log(`Passage ${id} did not have parent story id, skipping:`, newPassage);
				return;
			}

			if (!stories[newPassage.story]) {
				console.log(`Passage ${id} is orphaned (looking for ${newPassage.story}), skipping`);
				return;
			};

			stories[newPassage.story].passages.push(newPassage);
		});

		// Finally, we dispatch actions to add the stories to the store.

		Object.keys(stories).forEach(id => {
			createStory(store, stories[id]);
		});
	}
};
