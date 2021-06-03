import {satisfies} from 'semver';
import uuid from 'tiny-uuid';
import {Story} from '../../stories.types';
import {storyDefaults} from '../../defaults';
import {StoryFormat} from '../../../story-formats';
import {repairPassage} from './repair-passage';

function logRepair(
	story: Story,
	propName: keyof Story,
	repairedValue: any,
	detail?: string
) {
	let message =
		`Repairing story (name: "${story.name}", id: ${story.id}) by ` +
		`setting ${propName} to ${repairedValue}, was ${story[propName]}`;

	if (detail) {
		message += ` (${detail})`;
	}

	console.info(message);
}

export function repairStory(
	story: Story,
	allStories: Story[],
	allFormats: StoryFormat[],
	defaultFormat: StoryFormat
): Story {
	const storyDefs = storyDefaults();
	const repairs: Partial<Story> = {};

	// Give the story an ID if it has none.

	if (typeof story.id !== 'string' || story.id === '') {
		const newId = uuid();

		logRepair(story, 'id', newId, 'was bad type or empty string');
		repairs.id = newId;
	}

	// Give the story an IFID if it has none.

	if (typeof story.ifid !== 'string' || story.id === '') {
		const newIfid = uuid();

		logRepair(story, 'ifid', newIfid, 'was bad type or empty string');
		repairs.ifid = newIfid;
	}

	// Apply default properties to the story.

	Object.entries(storyDefs).forEach(([key, value]) => {
		const defKey = key as keyof typeof storyDefs;

		if (
			(typeof value === 'number' && !Number.isFinite(story[defKey])) ||
			typeof value !== typeof story[defKey]
		) {
			logRepair(story, defKey, storyDefs[defKey]);
			(repairs[defKey] as Story[typeof defKey]) = storyDefs[defKey];
		}
	});

	if (
		typeof story.storyFormat !== 'string' ||
		story.storyFormat === '' ||
		typeof story.storyFormatVersion !== 'string' ||
		story.storyFormatVersion === ''
	) {
		// Assign the story the default story format if it has none.

		logRepair(
			story,
			'storyFormat',
			defaultFormat.name,
			'was bad type or unset'
		);
		logRepair(
			story,
			'storyFormatVersion',
			defaultFormat.version,
			'was bad type or unset'
		);
		repairs.storyFormat = defaultFormat.name;
		repairs.storyFormatVersion = defaultFormat.version;
	} else if (
		!allFormats.some(
			format =>
				format.name === story.storyFormat &&
				format.version === story.storyFormatVersion
		)
	) {
		// If the story has a nonexistent story format, try to match it to one that
		// does, using semver as a guide.

		const repairFormat = allFormats.find(
			format =>
				format.name === story.storyFormat &&
				satisfies(format.version, '^' + story.storyFormatVersion)
		);

		if (repairFormat) {
			logRepair(
				story,
				'storyFormat',
				repairFormat.name,
				'no match in existing formats but found one that satisfies semver'
			);
			logRepair(
				story,
				'storyFormatVersion',
				repairFormat.version,
				'no match in existing formats but found one that satisfies semver'
			);
			repairs.storyFormat = repairFormat.name;
			repairs.storyFormatVersion = repairFormat.version;
		} else {
			logRepair(
				story,
				'storyFormat',
				defaultFormat.name,
				'no match in existing formats and could not find one that satisfies semver'
			);
			logRepair(
				story,
				'storyFormatVersion',
				defaultFormat.version,
				'no match in existing formats and could not find one that satisfies semver'
			);
			repairs.storyFormat = defaultFormat.name;
			repairs.storyFormatVersion = defaultFormat.version;
		}
	}

	// Repair ID conflicts with other stories.

	if (
		allStories.some(otherStory => {
			if (otherStory === story) {
				return false;
			}

			return otherStory.id === story.id;
		})
	) {
		const newId = uuid();

		logRepair(story, 'id', newId, "conflicted with another story's ID");
		repairs.id = newId;
	}

	// Repair all passages. All story ID changes must be before this to prevent
	// mismatches. We merge in repairs temporarily here so that passages see the
	// most correct ID.

	let anyPassageRepaired = false;
	const repairedPassages = story.passages.map(passage => {
		const repairedPassage = repairPassage(passage, {...story, ...repairs});

		if (repairedPassage !== passage) {
			anyPassageRepaired = true;
			return repairedPassage;
		}

		return passage;
	});

	if (anyPassageRepaired) {
		repairs.passages = repairedPassages;
	}

	if (Object.keys(repairs).length > 0) {
		return {...story, ...repairs};
	}

	return story;
}
