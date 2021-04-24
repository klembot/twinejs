import {Thunk} from 'react-hook-thunk-reducer';
import {
	passageWithId,
	passageWithName,
	StoriesAction,
	StoriesState
} from '../stories';
import {StoriesActionOrThunk} from './undoable-stories.types';

export function reverseAction(
	action: StoriesAction,
	state: StoriesState
): StoriesActionOrThunk {
	switch (action.type) {
		case 'createPassage':
			if (action.props.id) {
				return {
					type: 'deletePassage',
					passageId: action.props.id,
					storyId: action.storyId
				};
			} else if (action.props.name) {
				// This is dependant on the fact that we will only undo this action
				// immediately--otherwise this could create havoc if the passage has
				// been renamed in the meantime.
				//
				// This also assumes that the create action will succeed--e.g. there are
				// no conflicts.
				const reverseThunk: Thunk<StoriesState, StoriesAction> = (
					dispatch,
					getState
				) => {
					dispatch({
						type: 'deletePassage',
						passageId: passageWithName(
							getState(),
							action.storyId,
							action.props.name!
						).id,
						storyId: action.storyId
					});
				};

				return reverseThunk;
			} else {
				throw new Error(
					"Can't reverse a createPassage action without either name or ID"
				);
			}

		case 'deletePassage':
			return {
				type: 'createPassage',
				props: passageWithId(state, action.storyId, action.passageId),
				storyId: action.storyId
			};

		case 'deletePassages':
			return {
				type: 'createPassages',
				props: action.passageIds.map(passageId =>
					passageWithId(state, action.storyId, passageId)
				),
				storyId: action.storyId
			};
	}

	throw new Error(`Don't know how to reverse action type "${action.type}"`);
}
