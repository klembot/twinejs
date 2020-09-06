import isFinite from 'lodash.isfinite';
import linkParser from '@/util/link-parser';
import {passageDefaults} from '../defaults';

export function createNewlyLinkedPassages(
	{commit, getters},
	{oldText, passageId, storyId}
) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	const passage = story.passages.find(passage => passage.id === passageId);

	if (!passage) {
		throw new Error(
			`There is no passage in this story with ID "${passageId}".`
		);
	}

	const oldLinks = linkParser(oldText);
	const toCreate = linkParser(passage.text).filter(
		l => !oldLinks.includes(l) && !story.passages.some(p => p.name === l)
	);

	if (toCreate.length === 0) {
		return;
	}

	/*
	Some magic numbers here to get passages to match the grid. We assume passage
	default dimensions of 100x100 and a grid size of 25.
	*/

	const passageGap = 50;

	const newTop = passage.top + passage.height + passageGap;
	const newPassagesWidth =
		toCreate.length * passageDefaults.width +
		(toCreate.length - 1) * passageGap;

	/*
	Horizontally center the passages.
	*/

	let newLeft = passage.left + (passage.width - newPassagesWidth) / 2;

	/*
	Actually create them.
	*/

	toCreate.forEach(name => {
		createPassage(
			{commit, getters},
			{
				storyId,
				passageProps: {
					name,
					left: newLeft,
					top: newTop
				}
			}
		);
		newLeft += passageDefaults.width + passageGap;
	});
}

export function createPassage({commit, getters}, {passageProps, storyId}) {
	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	if (story.passages.some(p => p.name === passageProps.name)) {
		throw new Error(
			`There is already a passage in this story named "${passageProps.name}".`
		);
	}

	commit('createPassage', {passageProps, storyId});
}

export function createUntitledPassage(
	{commit, getters},
	{centerX, centerY, storyId}
) {
	if (!isFinite(centerX)) {
		throw new Error('centerX is not a number');
	}

	if (!isFinite(centerY)) {
		throw new Error('centerY is not a number');
	}

	const story = getters.storyWithId(storyId);

	if (!story) {
		throw new Error(`No story exists with ID "${storyId}".`);
	}

	let passageName = passageDefaults.name;

	/*
	If a passage already exists with that name, add a number and keep
	incrementing until we get a unique one.
	*/

	if (story.passages.some(p => p.name === passageName)) {
		let suffix = 1;

		while (story.passages.some(p => p.name === passageName + ' ' + suffix)) {
			suffix++;
		}

		passageName += ' ' + suffix;
	}

	/*
	Center it at the position requested. TODO: move it so it doesn't overlap
	another passage.
	*/

	const passageProps = {
		storyId,
		name: passageName,
		left: centerX - passageDefaults.width / 2,
		top: centerY - passageDefaults.height / 2
	};

	commit('createPassage', {passageProps, storyId});
}
