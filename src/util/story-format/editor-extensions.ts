import {StoryFormat} from '../../store/story-formats';
import {satisfies} from 'semver';

/**
 * Returns editor extensions in a format that fit the Twine version specified.
 * If none are available, then this returns undefined.
 */
export function formatEditorExtensions(
	format: StoryFormat,
	twineVersion: string
) {
	if (format.loadState !== 'loaded') {
		return;
	}

	if (!format.properties.editorExtensions?.twine) {
		return;
	}

	const extensions = Object.keys(
		format.properties.editorExtensions.twine
	).filter(semverSpec => satisfies(twineVersion, semverSpec));

	if (extensions.length === 0) {
		console.info(
			`${format.name} ${format.version} has editor extensions, but none that ${twineVersion} satisfies`
		);
		return;
	}

	if (extensions.length > 1) {
		console.warn(
			`More than one set of editor extensions for ${format.name} ${format.version} is satisfied by ${twineVersion}. Using the first.`
		);
	}

	return format.properties.editorExtensions.twine[extensions[0]];
}
