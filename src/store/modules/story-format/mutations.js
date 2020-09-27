import uuid from 'tiny-uuid';
import {formatDefaults} from './defaults';

export function createFormat(state, {storyFormatProps}) {
	state.formats.push({
		id: uuid(),
		...formatDefaults,
		...storyFormatProps,
		properties: null
	});
}

export function deleteFormat(state, {storyFormatId}) {
	state.formats = state.formats.filter(f => f.id !== storyFormatId);
}

export function setCreateFormatFromUrlError(state, {error}) {
	state.createFormatFromUrlError = error;
}

export function updateFormat(state, {storyFormatId, storyFormatProps}) {
	/*
	Sets properties on a format, usually after they have been loaded via JSONP.
	*/

	let format = state.formats.find(f => f.id === storyFormatId);

	if (!format) {
		/* Do nothing. */
		return;
	}

	Object.assign(format, storyFormatProps);
}
