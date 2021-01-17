import uuid from 'tiny-uuid';
import {passageDefaults, storyDefaults} from './defaults';

export function createStory(state, {storyProps}) {
	let story = {
		id: uuid(),
		lastUpdate: new Date(),
		ifid: uuid().toUpperCase(),
		tagColors: {},
		passages: [],
		...storyDefaults,
		...storyProps
	};

	/*
	If we are prepopulating the story with passages, make sure they have the
	correct ID linkage, and at least meake sure basic properties are set. If they
	are not, Vuex reactivity appears to act unpredictably if these properties are
	later set.
	*/

	story.passages = story.passages.map(passage => ({
		...passageDefaults,
		...passage,
		story: story.id
	}));
	state.stories.push(story);
}

export function updateStory(state, {storyId, storyProps}) {
	let story = state.stories.find(s => s.id === storyId);

	if (!story) {
		console.warn(`There is no story with ID ${storyId}, ignoring update.`);
		return;
	}

	Object.assign(story, {...storyProps, lastUpdate: new Date()});
}

export function deleteStory(state, {storyId}) {
	if (!state.stories.find(s => s.id === storyId)) {
		console.warn(`There is no story with ID ${storyId}, ignoring delete.`);
		return;
	}

	state.stories = state.stories.filter(s => s.id !== storyId);
}

export function createPassage(state, {passageProps, storyId}) {
	let story = state.stories.find(s => s.id === storyId);

	if (!story) {
		console.warn(
			`There is no story with ID ${storyId}, ignoring passage creation.`
		);
		return;
	}

	const newPassage = {
		...passageDefaults,
		id: uuid(),
		...passageProps
	};

	newPassage.story = storyId;
	story.passages.push(newPassage);

	if (story.passages.length === 1) {
		story.startPassage = newPassage.id;
	}

	story.lastUpdate = new Date();
}

export function updatePassage(state, {passageId, passageProps, storyId}) {
	const story = state.stories.find(s => s.id === storyId);

	if (!story) {
		console.warn(
			`There is no story with ID ${storyId}, ignoring passage update.`
		);
		return;
	}

	const passage = story.passages.find(p => p.id === passageId);

	if (!passage) {
		console.warn(
			`There is no passage with ID ${passageId} in story ID ${storyId}, ignoring passage update.`
		);
		return;
	}

	Object.assign(passage, passageProps);
	story.lastUpdate = new Date();

	// TODO: if the passage's name was updated, change linking passages to match.
}

export function deletePassage(state, {passageId, storyId}) {
	const story = state.stories.find(s => s.id === storyId);

	if (!story) {
		console.warn(
			`There is no story with ID ${storyId}, ignoring passage delete.`
		);
		return;
	}

	if (!story.passages.find(p => p.id === passageId)) {
		console.warn(
			`There is no passage with ID ${passageId} in story ID ${storyId}, ignoring passage delete.`
		);
		return;
	}

	story.passages = story.passages.filter(passage => passage.id !== passageId);
	story.lastUpdate = new Date();
}
