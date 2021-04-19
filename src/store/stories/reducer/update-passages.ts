import {Passage, StoriesState} from '../stories.types';
import {updatePassage} from './update-passage';

export function updatePassages(
	state: StoriesState,
	storyId: string,
	passageUpdates: Record<string, Partial<Passage>>
) {
	return Object.keys(passageUpdates).reduce(
		(state, passageId) =>
			updatePassage(state, storyId, passageId, passageUpdates[passageId]),
		state
	);
}
