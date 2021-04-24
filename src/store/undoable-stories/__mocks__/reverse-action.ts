import {StoriesAction, StoriesState} from '../../stories';

export function reverseAction(action: StoriesAction, state: StoriesState) {
	return {mockReversed: true, action, state};
}
