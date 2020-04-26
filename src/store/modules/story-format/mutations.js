import uuid from 'tiny-uuid';
import {formatDefaults} from './defaults';

export function createFormat(state, {storyFormatProps}) {
	state.formats.push({
		id: uuid(),
		...formatDefaults,
		...storyFormatProps,
		loaded: false,
		properties: {}
	});
}

export function deleteFormat(state, {storyFormatId}) {
	state.formats = state.formats.filter(f => f.id !== storyFormatId);
}

export function setAddFormatError(state, {message}) {
	state.addFormatERror = message;
}

export function setFormatProperties(state, {storyFormatId, storyFormatProps}) {
	/*
	Sets properties on a format, usually after they have been loaded via JSONP.
	*/

	let format = state.formats.find(f => f.id === storyFormatId);

	if (!format) {
		/* Do nothing. */
		return;
	}

	format.properties = {...storyFormatProps};
	format.loaded = true;

	/*
	A format may supply a setup function that runs when the format is first
	loaded.
	*/

	if (format.properties.setup) {
		format.properties.setup.call(format);
	}
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
