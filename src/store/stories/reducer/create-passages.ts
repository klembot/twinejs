import {Passage, StoriesState} from '../stories.types';
import {createPassage} from './create-passage';

export function createPassages(
	state: StoriesState,
	storyId: string,
	passageProps: Partial<Passage>[]
) {
	return passageProps.reduce(
		(state, props) => createPassage(state, storyId, props),
		state
	);
}
