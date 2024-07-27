import {v4 as uuid} from '@lukeed/uuid';
import sortBy from 'lodash/sortBy';
import {Passage, passageDefaults, Story, storyDefaults} from '../store/stories';
import {unusedName} from './unused-name';

const linebreakRegExp = /\r?\n/;

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
	return value.replace(/^::/gm, '\\::');
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
 * Converts Twee source to a passage. If it can't be parsed, then an error is
 * thrown. If it can partially parse the passage, it will do so.
 */
export function passageFromTwee(source: string): Omit<Passage, 'story'> {
	const [headerLine, ...lines] = source.split(linebreakRegExp);

	// The first line should be the header, with name, tags, and metadata. Name
	// needs to capture a trailing `\ `. Repeated trailing spaces should get
	// captured by the main group, since they include non-whitespace.
	//
	// Roughly translating this regexp: ::, whitespace, name, whitespace, [tags]?,
	// whitespace, {metadata}?, whitespace
	const headerBits = /^::\s*(.*?(?:\\\s)?)\s*(\[.*?\])?\s*(\{.*?\})?\s*$/.exec(
		headerLine
	);

	if (!headerBits) {
		throw new Error(`Header line couldn't be parsed: ${headerLine}`);
	}

	const [, rawName, rawTags, rawMetadata] = headerBits;

	if (rawName.trim() === '') {
		throw new Error(
			`Passage name couldn't be found in header line: ${headerLine}`
		);
	}

	const passage: Omit<Passage, 'story'> = {
		...passageDefaults(),
		id: uuid(),
		name: unescapeForTweeHeader(
			rawName
				.replace(/^(\\\s)+/g, match => ' '.repeat(match.length / 2))
				.replace(/(\\\s)+$/g, match => ' '.repeat(match.length / 2))
		),
		tags: [],
		text: lines.map(unescapeForTweeText).join('\n').trim()
	};

	if (rawTags) {
		// Remove enclosing brackets and split on whitespace.

		passage.tags = rawTags
			.replace(/^\[(.*)\]$/g, '$1')
			.split(/\s/)
			.filter(tag => tag.trim() !== '')
			.map(tag => unescapeForTweeHeader(tag));
	}

	if (rawMetadata) {
		// Try to parse it as JSON.

		try {
			const metadata = JSON.parse(rawMetadata);

			if (typeof metadata.position === 'string') {
				const [left, top] = metadata.position.split(',').map(parseFloat);

				if (typeof left === 'number' && typeof top === 'number') {
					passage.left = left;
					passage.top = top;
				} else {
					console.warn(
						`Couldn't parse passage position metadata ${metadata.position}`
					);
				}
			}

			if (typeof metadata.size === 'string') {
				const [width, height] = metadata.size.split(',').map(parseFloat);

				if (typeof width === 'number' && typeof height === 'number') {
					passage.width = width;
					passage.height = height;
				} else {
					console.warn(`Couldn't parse passage size metadata ${metadata.size}`);
				}
			}
		} catch (error) {
			console.warn(`Couldn't parse passage metadata ${rawMetadata}`);
		}
	}

	return passage;
}

/**
 * Converts a story from Twee source.
 */
export function storyFromTwee(source: string) {
	const id = uuid();

	const story: Story = {
		...storyDefaults(),
		id,
		ifid: uuid().toUpperCase(),
		lastUpdate: new Date(),
		passages: source
			.split(/^::/m)
			.filter(s => s.trim() !== '')
			.map(s => ':: ' + s)
			.map(passageFromTwee)
			.map(passage => ({...passage, story: id})),
		script: ''
	};

	// Remove all passages with a script or stylesheet tags and put them in the
	// story's properties instead.

	story.passages = story.passages.filter(passage => {
		const isScript = passage.tags.includes('script');
		const isStylesheet = passage.tags.includes('stylesheet');

		// If the passage has neither *or* both tags, treat it as normal. Behavior
		// when a passage is tagged with both is not currently spec'd, but let's
		// assume the user is confused.

		if ((!isScript && !isStylesheet) || (isScript && isStylesheet)) {
			return true;
		}

		if (isScript) {
			story.script += passage.text + '\n';
		} else if (isStylesheet) {
			story.stylesheet += passage.text + '\n';
		}

		return false;
	});

	// Trim any extra whitespace in the script and stylesheet we created above.

	story.script = story.script.trim();
	story.stylesheet = story.stylesheet.trim();

	// If there is a StoryTitle passage, remove it and set the story name.

	const titlePassageIndex = story.passages.findIndex(
		passage => passage.name === 'StoryTitle'
	);

	if (titlePassageIndex !== -1) {
		story.name = story.passages[titlePassageIndex].text.trim();
		story.passages.splice(titlePassageIndex, 1);
	}

	// If there is a StoryData passage, remove it and apply properties contained
	// there.

	const dataPassageIndex = story.passages.findIndex(
		passage => passage.name === 'StoryData'
	);

	if (dataPassageIndex !== -1) {
		const dataPassage = story.passages[dataPassageIndex];

		story.passages.splice(dataPassageIndex, 1);

		try {
			const {
				ifid,
				format,
				'format-version': formatVersion,
				start,
				'tag-colors': tagColors,
				zoom
			} = JSON.parse(dataPassage.text);

			if (typeof ifid === 'string') {
				story.ifid = ifid;
			}

			if (typeof format === 'string') {
				story.storyFormat = format;
			}

			if (typeof formatVersion === 'string') {
				story.storyFormatVersion = formatVersion;
			}

			if (typeof start === 'string') {
				const startPassage = story.passages.find(
					passage => passage.name === start
				);

				if (startPassage) {
					story.startPassage = startPassage.id;
				} else {
					console.warn(`Couldn't find start passage with name "${start}"`);
				}
			}

			if (typeof tagColors === 'object') {
				for (const tagName in tagColors) {
					if (typeof tagColors[tagName] === 'string') {
						story.tagColors[tagName] = tagColors[tagName];
					} else {
						console.warn(`Tag "${tagName}" has non-string color`);
					}
				}
			}

			if (typeof zoom === 'number') {
				story.zoom = zoom;
			}
		} catch (error) {
			console.warn(`Couldn't parse story data: ${dataPassage.text}`);
		}
	} else {
		console.warn('No StoryData passage is present in Twee');
	}

	// Detect old Twee format, which would have no passage metadata, and put
	// passages in a grid.

	if (story.passages.every(({left, top}) => left === 0 && top === 0)) {
		story.passages = story.passages.map((passage, index) => ({
			...passage,
			left: 25 + 125 * (index % 10),
			top: 25 + 125 * Math.floor(index / 10)
		}));
	}

	return story;
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

	let result = `${storyTitle}\n\n\n${storyData}\n\n\n${sortBy(story.passages, [
		'name'
	])
		.map(passageToTwee)
		.join('\n\n')}`;

	// If the story has script or stylesheet, they need to be converted to tagged
	// passages. These passage names are not part of the Twee spec.

	const passageNames = story.passages.map(({name}) => name);

	if (story.script.trim() !== '') {
		const scriptPassageName = unusedName('StoryScript', passageNames);

		result += `\n\n:: ${scriptPassageName} [script]\n${escapeForTweeText(
			story.script
		)}`;
	}

	if (story.stylesheet.trim() !== '') {
		const stylesheetPassageName = unusedName('StoryStylesheet', passageNames);

		result += `\n\n:: ${stylesheetPassageName} [stylesheet]\n${escapeForTweeText(
			story.stylesheet
		)}`;
	}

	return result;
}

/**
 * Unescapes characters with special meanings in a Twee passage header (brackets,
 * curly quotes, and backslashes).
 */
export function unescapeForTweeHeader(value: string) {
	return value.replace(/\\([[\]{}])/g, '$1').replace(/\\\\/g, '\\');
}

/**
 * Unescapes characters that would disrupt parsing of passage text, i.e. `::` at
 * the start of a line.
 */
export function unescapeForTweeText(value: string) {
	return value.replace(/^\\:/gm, ':');
}
