import {passageDefaults} from '../defaults';
import {CreatePassageAction, Story} from '../stories.types';

/**
 * Creates a new, untitled passage centered at a point in the story. This
 * automatically increments a number at the end of the passage name to ensure
 * it's unique.
 */
export function createUntitledPassage(
	story: Story,
	centerX: number,
	centerY: number
): CreatePassageAction {
	let passageName = passageDefaults.name;

	// If a passage already exists with that name, add a number and keep
	// incrementing until we get a unique one.

	if (story.passages.some(p => p.name === passageName)) {
		let suffix = 1;

		while (
			// eslint-disable-next-line no-loop-func
			story.passages.some(p => p.name === passageName + ' ' + suffix)
		) {
			suffix++;
		}

		passageName += ' ' + suffix;
	}

	// Center it at the position requested. TODO: move it so it doesn't overlap
	// another passage.

	return {
		type: 'createPassage',
		storyId: story.id,
		props: {
			story: story.id,
			name: passageName,
			left: centerX - passageDefaults().width / 2,
			top: centerY - passageDefaults().height / 2
		}
	};
}
