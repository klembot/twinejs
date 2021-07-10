import {Thunk} from 'react-hook-thunk-reducer';
import {
	passageWithId,
	passageWithName,
	storyWithId,
	Passage,
	StoriesAction,
	StoriesState,
	Story
} from '../stories';
import {StoriesActionOrThunk} from './undoable-stories.types';

/**
 * Returns an action or thunk to reverse a single action.
 */
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

		// TODO: crashes on a replace all that affects a passage name, unclear why

		case 'createPassages':
			if (action.props.some(prop => !prop.id && !prop.name)) {
				throw new Error(
					"Can't reverse a createPassages action where a prop set doesn't have either name or ID"
				);
			}

			return (dispatch, getState) => {
				action.props.forEach(props => {
					if (props.id) {
						dispatch({
							type: 'deletePassage',
							passageId: props.id,
							storyId: action.storyId
						});
					} else if (props.name) {
						// This is dependent on the fact that we will only undo this action
						// immediately--see comment about the createPassage action.

						dispatch({
							type: 'deletePassage',
							passageId: passageWithName(getState(), action.storyId, props.name)
								.id,
							storyId: action.storyId
						});
					}
				});
			};

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

		case 'updatePassage': {
			const passage = passageWithId(state, action.storyId, action.passageId);
			const props = Object.keys(action.props).reduce(
				(result, propName) => ({
					...result,
					[propName]: passage[propName as keyof Passage]
				}),
				{} as Passage
			);

			return {
				type: 'updatePassage',
				props,
				passageId: action.passageId,
				storyId: action.storyId
			};
		}

		case 'updatePassages':
			return {
				type: 'updatePassages',
				passageUpdates: Object.keys(action.passageUpdates).reduce(
					(result, passageId) => {
						const passage = passageWithId(state, action.storyId, passageId);

						return {
							...result,
							[passageId]: Object.keys(action.passageUpdates[passageId]).reduce(
								(passageResult, propName) => ({
									...passageResult,
									[propName]: passage[propName as keyof Passage]
								}),
								{} as Passage
							)
						};
					},
					{} as Record<string, Partial<Passage>>
				),
				storyId: action.storyId
			};

		case 'updateStory': {
			const story = storyWithId(state, action.storyId);
			const props = Object.keys(action.props).reduce(
				(result, propName) => ({
					...result,
					[propName]: story[propName as keyof Story]
				}),
				{} as Story
			);

			return {
				type: 'updateStory',
				props,
				storyId: action.storyId
			};
		}
	}

	throw new Error(`Don't know how to reverse action type "${action.type}"`);
}
