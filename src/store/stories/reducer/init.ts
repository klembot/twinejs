import {Story, StoriesState} from '../stories.types';

export function initState(state: StoriesState, init: Story[]) {
	return [...init];
}
