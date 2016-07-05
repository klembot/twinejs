// Functions for moving stories in and out of local storage. This module in
// particular needs to remain well-optimized, as it has a direct effect on load
// time.

let { createStory } = require('../actions');
let commaList = require('./comma-list');

module.exports = {
	// Saves an array of story objects to local storage.

	save(store, stories) {
		let storyIdList = window.localStorage.getItem('twine-stories') || '';
		let passageIdList = window.localStorage.getItem('twine-passages') || '';

		stories.forEach(story => {
			storyIdList = commaList.addUnique(storyIdList, story.id);

			// We have to remove the passages property before serializing the
			// story, as those are serialized under separate keys.

			window.localStorage.setItem(
				'twine-stories-' + story.id,
				JSON.stringify(
					Object.assign({}, story, { passages: undefined })
				)
			);

			story.passages.forEach(passage => {
				passageIdList = commaList.addUnique(passageIdList, passage.id);

				window.localStorage.setItem(
					'twine-passages-' + passage.id,
					JSON.stringify(passage)
				);
			});
		});

		window.localStorage.setItem('twine-stories', storyIdList);
		window.localStorage.setItem('twine-passages', passageIdList);
	},

	// Removes stories from local storage, e.g. after being deleted from the
	// store.

	delete(store, stories) {
		let storyIdList = window.localStorage.getItem('twine-stories') || '';
		let passageIdList = window.localStorage.getItem('twine-passages') || '';

		stories.forEach(story => {
			// We delete passages first, so that if an error occurs midprocess, we
			// don't end up orphaning any.

			story.passages.forEach(passage => {
				passageIdList = commaList.remove(passageIdList, passage.id);
				window.localStorage.removeItem('twine-passages-' + passage.id);
			});

			// And then the parent story.

			storyIdList = commaList.remove(storyIdList, story.id);
			window.localStorage.removeItem('twine-stories-' + story.id);
		});

		window.localStorage.setItem('twine-stories', storyIdList);
		window.localStorage.setItem('twine-passages', passageIdList);
	},

	load(store) {
		let stories = {};
		const serializedStories = window.localStorage.getItem('twine-stories');

		if (!serializedStories) {
			return;
		}

		// First, deserialize stories. We index them by id so that we can
		// quickly add passages to them as they are deserialized.

		serializedStories.split(',').forEach(id => {
			let newStory = JSON.parse(
				window.localStorage.getItem('twine-stories-' + id)
			);

			if (newStory) {
				newStory.passages = [];
				stories[newStory.id] = newStory;
			}
			else {
				console.warn(
					`Could not parse story ${id}, skipping`,
					window.localStorage.getItem('twine-stories-' + id)
				);
			}
		});

		// Then create passages, adding them to their parent story.

		const serializedPassages = window.localStorage.getItem('twine-passages');

		if (serializedPassages) {
			serializedPassages.split(',').forEach(id => {
				let newPassage = JSON.parse(
					window.localStorage.getItem('twine-passages-' + id)
				);

				if (!newPassage || !newPassage.story) {
					console.warn(`Passage ${id} did not have parent story id, skipping`, newPassage);
					return;
				}

				if (!stories[newPassage.story]) {
					console.warn(`Passage ${id} is orphaned (looking for ${newPassage.story}), skipping`);
					return;
				};

				stories[newPassage.story].passages.push(newPassage);
			});
		}

		// Finally, we dispatch actions to add the stories to the store.

		Object.keys(stories).forEach(id => {
			createStory(store, stories[id]);
		});
	}
};
