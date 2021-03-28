import {StoriesState} from '../stories.types';
import {storyWithId} from '../getters';

export function deleteStory(state: StoriesState, storyId: string) {
	// This will throw an error for us if the story doesn't exist.
	storyWithId(state, storyId);
	return state.filter(s => s.id !== storyId);
}
