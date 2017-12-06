/*
Functions for moving stories in and out of local storage. This module in
particular needs to remain well-optimized, as it has a direct effect on load
time. As a result, saving requires that you start and end a transaction
manually. This minimizes the number of writes to local storage.
*/

let { createStory } = require('../actions/story');
let { passageDefaults, storyDefaults } = require('../store/story');
let commaList = require('./comma-list');

const story = module.exports = {
	/*
	A wrapper for a series of save/delete operations. This takes a function as
	argument that will receive an object keeping track of the transaction. This
	function should then make save and delete calls as necessary, passing the
	provided transaction object as their first argument.
	*/

	update(func) {
		let transaction = {
			storyIds: window.localStorage.getItem('twine-stories') || '',
			passageIds: window.localStorage.getItem('twine-passages') || ''
		};

		func(transaction);

		window.localStorage.setItem('twine-stories', transaction.storyIds);
		window.localStorage.setItem('twine-passages', transaction.passageIds);
	},

	/*
	Saves a story to local storage. This does *not* affect any child passages.
	*/

	saveStory(transaction, story) {
		if (!story.id) {
			throw new Error('Story has no id');
		}
		
		transaction.storyIds = commaList.addUnique(
			transaction.storyIds,
			story.id
		);

		/*
		We have to remove the passages property before serializing the story,
		as those are serialized under separate keys.
		*/

		window.localStorage.setItem(
			'twine-stories-' + story.id,
			JSON.stringify(
				Object.assign({}, story, { passages: undefined })
			)
		);
	},

	/*
	Deletes a story from local storage. This does *not* affect any child
	passages. You *must* delete child passages manually.
	*/

	deleteStory(transaction, story) {
		if (!story.id) {
			throw new Error('Story has no id');
		}
		
		transaction.storyIds = commaList.remove(transaction.storyIds, story.id);
		window.localStorage.removeItem('twine-stories-' + story.id);
	},

	/* Saves a passage to local storage. */

	savePassage(transaction, passage) {
		if (!passage.id) {
			throw new Error('Passage has no id');
		}
		
		transaction.passageIds = commaList.addUnique(
			transaction.passageIds,
			passage.id
		);

		window.localStorage.setItem(
			'twine-passages-' + passage.id,
			JSON.stringify(passage)
		);
	},

	/* Deletes a passage from local storage. */

	deletePassage(transaction, passage) {
		if (!passage.id) {
			throw new Error('Passage has no id');
		}

		story.deletePassageById(transaction, passage.id);
	},

	/* Deletes a passage from local storage. */

	deletePassageById(transaction, id) {
		transaction.passageIds = commaList.remove(
			transaction.passageIds,
			id
		);
		window.localStorage.removeItem('twine-passages-' + id);
	},

	load(store) {
		let stories = {};
		const serializedStories = window.localStorage.getItem('twine-stories');

		if (!serializedStories) {
			return;
		}

		/*
		First, deserialize stories. We index them by id so that we can quickly
		add passages to them as they are deserialized.
		*/

		serializedStories.split(',').forEach(id => {
			let newStory = JSON.parse(
				window.localStorage.getItem('twine-stories-' + id)
			);

			if (newStory) {
				/* Set defaults if any are missing. */

				Object.keys(storyDefaults).forEach(key => {
					if (newStory[key] === undefined) {
						newStory[key] = storyDefaults[key];
					}
				});
				
				/* Coerce the lastUpdate property to a date. */
				
				if (newStory.lastUpdate) {
					newStory.lastUpdate = new Date(
						Date.parse(newStory.lastUpdate)
					);
				}
				else {
					newStory.lastUpdate = new Date();
				}
				
				/*
				Force the passages property to be an empty array -- we'll
				populate it when we load passages below.
				*/

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

		/* Then create passages, adding them to their parent story. */

		const serializedPassages = window.localStorage.getItem('twine-passages');

		if (serializedPassages) {
			serializedPassages.split(',').forEach(id => {
				let newPassage = JSON.parse(
					window.localStorage.getItem('twine-passages-' + id)
				);

				if (!newPassage || !newPassage.story) {
					console.warn(
						`Passage ${id} did not have parent story id, skipping`,
						newPassage
					);
					return;
				}

				if (!stories[newPassage.story]) {
					console.warn(
						`Passage ${id} is orphaned (looking for ` +
						`${newPassage.story}), skipping`
					);
					return;
				}

				/* Set defaults if any are missing. */

				Object.keys(passageDefaults).forEach(key => {
					if (newPassage[key] === undefined) {
						newPassage[key] = passageDefaults[key];
					}
				});

				/* Remove empty tags. */

				newPassage.tags = newPassage.tags.filter(
					tag => tag.length && tag.length > 0
				);

				stories[newPassage.story].passages.push(newPassage);
			});
		}

		/* Finally, we dispatch actions to add the stories to the store. */

		Object.keys(stories).forEach(id => {
			createStory(store, stories[id]);
		});
	}
};
