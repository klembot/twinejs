import {passageDefaults} from '../defaults';
import {CreatePassageAction, Story} from '../stories.types';
import {rectsIntersect} from '../../../util/geometry';
import {unusedName} from '../../../util/unused-name';

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
	if (!Number.isFinite(centerX) || !Number.isFinite(centerY)) {
		throw new Error('Center must be a finite coordinate pair');
	}

	const defs = passageDefaults();
	const passageName = unusedName(
		defs.name,
		story.passages.map(passage => passage.name)
	);

	// Center it at the position requested, but move it outward until no overlaps are found.

	const passageGap = 25;
	const bounds = {
		height: defs.height,
		left: Math.max(centerX - defs.width / 2, 0),
		top: Math.max(centerY - defs.height / 2, 0),
		width: defs.width
	};

	if (story.snapToGrid) {
		bounds.left = Math.round(bounds.left / passageGap) * passageGap;
		bounds.top = Math.round(bounds.top / passageGap) * passageGap;
	}

	const needsMoving = () =>
		story.passages.some(passage => rectsIntersect(passage, bounds));

	while (needsMoving()) {
		// Try rightward.

		bounds.left += bounds.width + passageGap;

		if (!needsMoving()) {
			break;
		}

		// Try downward.

		bounds.left -= bounds.width + passageGap;
		bounds.top += bounds.height + passageGap;

		if (!needsMoving()) {
			break;
		}

		// Try leftward.

		if (bounds.left >= bounds.width + passageGap) {
			bounds.left -= bounds.width + passageGap;

			if (!needsMoving()) {
				break;
			}

			bounds.left += bounds.width + passageGap;
		}

		// Move downward permanently and repeat.

		bounds.top += bounds.height + passageGap;
	}

	return {
		type: 'createPassage',
		storyId: story.id,
		props: {
			...bounds,
			story: story.id,
			name: passageName
		}
	};
}
