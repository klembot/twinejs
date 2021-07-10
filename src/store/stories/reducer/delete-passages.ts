import {StoriesState} from '../stories.types';
import {deletePassage} from './delete-passage';

export function deletePassages(
	state: StoriesState,
	storyId: string,
	passageIds: string[]
) {
	return passageIds.reduce(
		(state, passageId) => deletePassage(state, storyId, passageId),
		state
	);
}
