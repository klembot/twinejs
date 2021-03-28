import {createPassage} from './create-passage';
import {createStory} from './create-story';
import {initState} from './init';
import {deleteStory} from './delete-story';
import {updatePassage} from './update-passage';
import {updateStory} from './update-story';
import {StoriesAction, StoriesState} from '../stories.types';

export const reducer: React.Reducer<StoriesState, StoriesAction> = (
	state,
	action
) => {
	switch (action.type) {
		case 'createPassage':
			return createPassage(state, action.storyId, action.props);

		case 'createStory':
			return createStory(state, action.props);

		case 'deleteStory':
			return deleteStory(state, action.storyId);

		case 'init':
			return initState(state, action.state);

		case 'updatePassage':
			return updatePassage(
				state,
				action.storyId,
				action.passageId,
				action.props
			);

		case 'updateStory':
			return updateStory(state, action.storyId, action.props);

		default:
			console.warn(`${action.type} not implemented yet`);
	}

	return state;
};
