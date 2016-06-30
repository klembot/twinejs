// A Vuex module for working with stories. This is meant to be incorporated by
// index.js.

const locale = require('../locale');
const uuid = require('tiny-uuid');
const ui = require('../ui');

// Defaults for newly-created objects.

const storyDefaults = {
	name: locale.say('Untitled Story'),
	startPassage: -1,
	zoom: 1,
	snapToGrid: false,
	stylesheet: '',
	script: '',
	storyFormat: ''
};

const passageDefaults = {
	story: -1,
	top: 0,
	left: 0,
	tags: [],
	name: locale.say('Untitled Passage'),

	text: ui.hasPrimaryTouchUI() ?
		locale.say('Tap this passage, then the pencil icon to edit it.')
		: locale.say('Double-click this passage to edit it.')
};

// A shorthand function for finding a particular story in the state, or a
// particular passage in a story.

function getStoryById(state, id) {
	let story = state.stories.find(story => story.id === id);

	if (!story) {
		throw new Error(`No story exists with id ${id}`);
	}

	return story;
}

function getPassageInStory(story, id) {
	let passage = story.passages.find(passage => passage.id === passageId);
	
	if (!passage) {
		throw new Error(`No passage exists in this story with id ${id}`);
	}

	return passage;
}

module.exports = {
	state: {
		stories: []
	},

	mutations: {
		CREATE_STORY(state, props) {
			state.stories.push(Object.assign(
				{
					id: uuid(),
					lastUpdate: new Date(),
					ifid: uuid().toUpperCase(),
					passages: []
				},
				storyDefaults,
				props
			));
		},

		UPDATE_STORY(state, id, props) {
			let story = getStoryById(state, id);

			Object.assign(story, props);
			story.lastUpdate = new Date();
		},

		DUPLICATE_STORY(state, id, dupeName) {
			throw new Error('Not implemented yet');
		},

		DELETE_STORY(state, id) {
			state.stories = state.stories.filter(story => story.id !== id);
		},

		CREATE_PASSAGE_IN_STORY(state, storyId, props) {
			let story = getStoryById(state, storyId);
			let newPassage = Object.assign(
				{
					id: uuid()
				},
				passageDefaults,
				props
			);

			newPassage.story = newstory.id;
			story.passages.push(newPassage);
			story.lastUpdate = new Date();
		},

		UPDATE_PASSAGE_IN_STORY(state, storyId, passageId, props) {
			let story = getStoryById(state, storyId);

			Object.assign(getPassageById(story, passageId), props);
			story.lastUpdate = new Date();
		},

		DELETE_PASSAGE_IN_STORY(state, storyId, passageId) {
			let story = getStoryById(state, storyId);
			story.passages =
				story.passages.filter(passage => passage.id !== passageId);
			story.lastUpdate = new Date();
		}
	}
};
