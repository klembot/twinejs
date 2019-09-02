/*
A Vuex module for working with stories.
*/

import uuid from 'tiny-uuid';
import * as getters from './getters';
import {passageDefaults, storyDefaults} from './defaults';
import {sanitize} from './passage-props';

export const state = {stories: []};

export const mutations = {
	createStory(state, props) {
		let story = {
			id: uuid(),
			lastUpdate: new Date(),
			ifid: uuid().toUpperCase(),
			tagColors: {},
			passages: [],
			...storyDefaults,
			...props
		};

		/*
		If we are prepopulating the story with passages, make sure they have the
		correct ID linkage, and sanitize them for basic correctness.
		*/

		story.passages.map(p => sanitize({...p, story: story.id}));
		state.stories.push(story);
	},
	updateStory(state, storyId, props) {
		let story = getters.storyWithId(state, storyId);

		Object.assign(story, {...props, lastUpdate: new Date()});
	},
	deleteStory(state, storyId) {
		state.stories = state.stories.filter(s => s.id !== storyId);
	},
	createPassage(state, storyId, props) {
		const story = getStoryById(state, storyId);
		const newPassage = Object.assign(
			{
				id: idFor(story.name + uuid())
			},
			passageDefaults,
			props
		);

		/*
		Force the top and left properties to be at least zero, to keep
		passages onscreen.
		*/

		if (newPassage.left < 0) {
			newPassage.left = 0;
		}

		if (newPassage.top < 0) {
			newPassage.top = 0;
		}

		newPassage.story = story.id;
		story.passages.push(newPassage);

		if (story.passages.length === 1) {
			story.startPassage = newPassage.id;
		}

		story.lastUpdate = new Date();
	},
	updatePassage(state, storyId, passageId, props) {
		let story;

		try {
			story = getStoryById(state, storyId);
		} catch (e) {
			return;
		}

		/*
		Force the top and left properties to be at least zero, to keep
		passages onscreen.
		*/

		if (props.left && props.left < 0) {
			props.left = 0;
		}

		if (props.top && props.top < 0) {
			props.top = 0;
		}

		let passage;

		try {
			passage = getPassageInStory(story, passageId);
		} catch (e) {
			return;
		}

		Object.assign(passage, props);
		story.lastUpdate = new Date();
	},
	deletePassage(state, storyId, passageId) {
		let story = getStoryById(state, storyId);

		story.passages = story.passages.filter(passage => passage.id !== passageId);
		story.lastUpdate = new Date();
	}
	// TODO: should be an action because we can do this with a createStory call
	// duplicateStory(state, storyId, newName) {
	// 	const original = getters.storyWithId(state, storyId);

	// 	if (original.name === newName) {
	// 		throw new Error(
	// 			'Duplicating a story to one with the same name is not permitted'
	// 		);
	// 	}

	// 	let story = Object.assign({}, original, {
	// 		id: idFor(newName),
	// 		ifid: uuid().toUpperCase(),
	// 		name: newName
	// 	});

	// 	/* We need to do a deep copy of the passages. */

	// 	story.passages = [];

	// 	original.passages.forEach(originalPassage => {
	// 		const passage = Object.assign({}, originalPassage, {
	// 			id: idFor(newName + originalPassage.name),
	// 			story: story.id
	// 		});

	// 		if (passage.tags) {
	// 			passage.tags = passage.tags.slice(0);
	// 		}

	// 		if (original.startPassage === originalPassage.id) {
	// 			story.startPassage = passage.id;
	// 		}

	// 		story.passages.push(passage);
	// 	});

	// 	state.stories.push(story);
	// },
	//
	// TODO: this too should be an action since it can also be done with a
	// createStory() call
	//
	// IMPORT_STORY(state, toImport) {
	// 	/*
	// 	See data/import.js for how the object that we receive is
	// 	structured.

	// 	Assign IDs to to everything, link passages to their story,
	// 	and set the story's startPassage property appropriately.
	// 	*/

	// 	toImport.id = idFor(toImport.name);

	// 	toImport.passages.forEach(p => {
	// 		p.id = idFor(toImport.name + p.name);
	// 		p.story = toImport.id;

	// 		if (p.pid === toImport.startPassagePid) {
	// 			toImport.startPassage = p.id;
	// 		}

	// 		delete p.pid;
	// 	});

	// 	delete toImport.startPassagePid;
	// 	state.stories.push(toImport);
	// },
};

export const actions = {
	createStory({commit}, props) {
		commit('createStory', props);
	}
};

export default {actions, getters, mutations, state, namespaced: true};
