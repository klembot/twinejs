import {createPassage} from './create-passage';
import {createPassages} from './create-passages';
import {createStory} from './create-story';
import {deletePassage} from './delete-passage';
import {deletePassages} from './delete-passages';
import {deleteStory} from './delete-story';
import {initState} from './init';
import {repairState} from './repair';
import {updatePassage} from './update-passage';
import {updatePassages} from './update-passages';
import {updateStory} from './update-story';
import {StoriesAction, StoriesState} from '../stories.types';

export const reducer: React.Reducer<StoriesState, StoriesAction> = (
	state,
	action
) => {
	switch (action.type) {
		case 'createPassage':
			return createPassage(state, action.storyId, action.props);

		case 'createPassages':
			return createPassages(state, action.storyId, action.props);

		case 'createStory':
			return createStory(state, action.props);

		case 'deletePassage':
			return deletePassage(state, action.storyId, action.passageId);

		case 'deletePassages':
			return deletePassages(state, action.storyId, action.passageIds);

		case 'deleteStory':
			return deleteStory(state, action.storyId);

		case 'init':
			return initState(state, action.state);

		case 'repair':
			return repairState(state, action.allFormats, action.defaultFormat);

		case 'updatePassage':
			return updatePassage(
				state,
				action.storyId,
				action.passageId,
				action.props
			);

		case 'updatePassages':
			return updatePassages(state, action.storyId, action.passageUpdates);

		case 'updateStory':
			return updateStory(state, action.storyId, action.props);

		default:
			console.warn(`${(action as any).type} not implemented yet`);
	}

	return state;
};
