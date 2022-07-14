import isAbsoluteUrl from 'is-absolute-url';
import semverLt from 'semver/functions/lt';
import {StoryFormat} from './story-formats.types';
import {PrefsState} from '../prefs';
import {gt} from 'semver';

export function filteredFormats(
	formats: StoryFormat[],
	filter: PrefsState['storyFormatListFilter']
): StoryFormat[] {
	switch (filter) {
		case 'all':
			return formats;

		case 'current':
			return Object.values(
				formats.reduce<Record<string, StoryFormat>>((result, format) => {
					if (
						!result[format.name] ||
						semverLt(result[format.name].version, format.version)
					) {
						return {...result, [format.name]: format};
					}

					return result;
				}, {})
			);

		case 'user':
			return formats.filter(format => format.userAdded);
	}
}

export function formatImageUrl(format: StoryFormat) {
	if (format.loadState !== 'loaded' || !format.properties.image) {
		throw new Error('Format has no image property');
	}

	if (isAbsoluteUrl(format.properties.image)) {
		return format.properties.image;
	}

	return format.url.replace(/\/[^/]*?$/, '/') + format.properties.image;
}

export function formatWithId(formats: StoryFormat[], id: string) {
	const result = formats.find(f => f.id === id);

	if (result) {
		return result;
	}

	throw new Error(`There is no story format with ID "${id}".`);
}

export function formatWithNameAndVersion(
	formats: StoryFormat[],
	name: string,
	version: string
) {
	const result = formats.find(f => f.name === name && f.version === version);

	if (result) {
		return result;
	}

	throw new Error(
		`There is no story format with name "${name}" and version "${version}".`
	);
}

export function newestFormatNamed(formats: StoryFormat[], name: string) {
	return formats.reduce<StoryFormat | undefined>((result, format) => {
		if (format.name !== name) {
			return result;
		}

		if (!result || gt(format.version, result.version)) {
			return format;
		}

		return result;
	}, undefined);
}

export function sortFormats(formats: StoryFormat[]) {
	return formats.sort((a, b) => {
		// First sort by name ascending...

		if (a.name < b.name) {
			return -1;
		}

		if (a.name > b.name) {
			return 1;
		}

		// ... then by version, in descending order.

		if (a.version === b.version) {
			return 0;
		}

		if (semverLt(b.version, a.version)) {
			return -1;
		}

		return 1;
	});
}
