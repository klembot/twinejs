import {v4 as uuid} from '@lukeed/uuid';
import {passageDefaults} from '../../defaults';
import {Passage, Story} from '../../stories.types';

function logRepair(
	passage: Passage,
	propName: keyof Passage,
	repairedValue: any,
	detail?: string
) {
	let message =
		`Repairing passage (name: "${passage.name}", id: ${passage.id}): ` +
		`setting ${propName} to ${repairedValue}, was ${passage[propName]}`;

	if (detail) {
		message += ` (${detail})`;
	}

	console.info(message);
}

export function repairPassage(passage: Passage, parentStory: Story): Passage {
	const passageDefs = passageDefaults();
	const repairs: Partial<Passage> = {};

	// Give the passage an ID if it has none.

	if (typeof passage.id !== 'string' || passage.id === '') {
		const newId = uuid();

		logRepair(passage, 'id', newId, 'was undefined or empty string');
		repairs.id = newId;
	}

	// Apply default properties to the passage.

	for (const key in passageDefs) {
		const value = passageDefs[key as keyof typeof passageDefs];
		const defKey = key as keyof typeof passageDefs;

		if (
			(typeof value === 'number' && !Number.isFinite(passage[defKey])) ||
			typeof value !== typeof passage[defKey]
		) {
			logRepair(passage, defKey, passageDefs[defKey]);
			(repairs[defKey] as Passage[typeof defKey]) = passageDefs[defKey];
		}
	}

	// Make passage coordinates 0 or greater.

	for (const pos of ['left', 'top']) {
		const posKey = pos as keyof Passage;

		if (
			typeof passage[posKey] === 'number' &&
			(passage[posKey] as number) < 0
		) {
			logRepair(passage, posKey, 0, 'was negative');
			(repairs[posKey] as Passage[typeof posKey]) = 0;
		}
	}

	// Make passage dimensions 5 or greater.

	for (const dim of ['height', 'width']) {
		const dimKey = dim as keyof Passage;

		if (
			typeof passage[dimKey] === 'number' &&
			(passage[dimKey] as number) < 5
		) {
			logRepair(passage, dimKey, 0, 'was less than 5');
			(repairs[dimKey] as Passage[typeof dimKey]) = 5;
		}
	}

	// Repair story property if it doesn't point to the parent story.

	if (passage.story !== parentStory.id) {
		logRepair(passage, 'story', parentStory.id, "didn't match parent story");
		repairs.story = parentStory.id;
	}

	// Repair ID conflicts with any other passage in the story.

	if (
		parentStory.passages.some(otherPassage => {
			if (otherPassage === passage) {
				return false;
			}

			return otherPassage.id === passage.id;
		})
	) {
		const newId = uuid();

		logRepair(
			passage,
			'id',
			newId,
			'conflicted with another passage in the story'
		);
		repairs.id = newId;
	}

	if (Object.keys(repairs).length > 0) {
		return {...passage, ...repairs};
	}

	return passage;
}
