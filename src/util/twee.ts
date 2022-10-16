import {sortBy} from 'lodash';
import {Passage, Story} from '../store/stories';

/**
 * Escapes characters with special meanings in a Twee passage header (brackets,
 * curly quotes, and backslashes).
 */
export function escapeForTweeHeader(value: string) {
	return value.replace(/\\/g, '\\\\').replace(/([[\]{}])/g, '\\$1');
}

/**
 * Escapes characters that would disrupt parsing of passage text, i.e. `::` at
 * the start of a line.
 */
export function escapeForTweeText(value: string) {
	return value.replace(/^::/gm, '\\:\\:');
}

/**
 * Converts a single passage to Twee.
 */
export function passageToTwee(passage: Passage) {
	const escapedName = escapeForTweeHeader(passage.name)
		.replace(/^\s+/g, match => '\\ '.repeat(match.length))
		.replace(/\s+$/g, match => '\\ '.repeat(match.length));
	const tags =
		passage.tags.length > 0
			? `[${passage.tags.map(escapeForTweeHeader).join(' ')}]`
			: undefined;
	const metadata = JSON.stringify({
		position: `${passage.left},${passage.top}`,
		size: `${passage.width},${passage.height}`
	}).replace(/\s+/g, '');
	const escapedText = escapeForTweeText(passage.text);

	return `:: ${escapedName}${
		tags ? ' ' + tags : ''
	} ${metadata}\n${escapedText}\n`;
}

/**
 * Converts a story to Twee.
 */
export function storyToTwee(story: Story) {
	const storyTitle = `:: StoryTitle\n${escapeForTweeText(story.name)}`;
	const startPassage = story.passages.find(p => p.id === story.startPassage);
	const storyData = `:: StoryData\n${JSON.stringify(
		{
			ifid: story.ifid,
			format: story.storyFormat,
			'format-version': story.storyFormatVersion,
			start: startPassage?.name,
			'tag-colors':
				Object.keys(story.tagColors).length > 0 ? story.tagColors : undefined,
			zoom: story.zoom
		},
		null,
		2
	)}`;

	return `${storyTitle}\n\n\n${storyData}\n\n\n${sortBy(story.passages, [
		'name'
	])
		.map(passageToTwee)
		.join('\n\n')}`;
}
