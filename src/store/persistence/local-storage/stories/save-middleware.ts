import {
	passageWithId,
	passageWithName,
	StoriesAction,
	StoriesState,
	storyWithId,
	storyWithName
} from '../../../stories';
import {isPersistablePassageChange} from '../../persistable-changes';
import {
	deletePassageById,
	deleteStory,
	doUpdateTransaction,
	savePassage,
	saveStory
} from './save';

let lastState: StoriesState;

/**
 * A middleware function to save changes to local storage. This should be called
 * *after* the main reducer runs.
 */
export function saveMiddleware(state: StoriesState, action: StoriesAction) {
	switch (action.type) {
		case 'init':
		case 'repair':
			// We take no action here on a repair action. This is to prevent messing up a
			// story's last modified date. If the user then edits the story, we'll save
			// their change and the repair then.
			break;

		case 'createPassage': {
			if (!action.props.name) {
				throw new Error('Passage was created but with no name specified');
			}

			const story = storyWithId(state, action.storyId);
			const passage = passageWithName(state, story.id, action.props.name);

			doUpdateTransaction(transaction => {
				saveStory(transaction, story);
				savePassage(transaction, passage);
			});
			break;
		}

		case 'createPassages': {
			const story = storyWithId(state, action.storyId);

			doUpdateTransaction(transaction => {
				saveStory(transaction, story);
				action.props.forEach(props => {
					if (!props.name) {
						throw new Error('Passage was created but with no name specified');
					}

					savePassage(
						transaction,
						passageWithName(state, story.id, props.name)
					);
				});
			});
			break;
		}

		case 'createStory':
			if (!action.props.name) {
				throw new Error('Story was created but with no name specified');
			}

			const story = storyWithName(state, action.props.name);

			doUpdateTransaction(transaction => {
				saveStory(transaction, story);
				story.passages.forEach(passage => savePassage(transaction, passage));
			});
			break;

		case 'deletePassage': {
			const story = storyWithId(state, action.storyId);

			// We can't dig up the passage in question right now, because
			// previousStories is only a shallow copy, and it's gone there at
			// this point in time.

			doUpdateTransaction(transaction => {
				saveStory(transaction, story);
				deletePassageById(transaction, action.passageId);
			});
			break;
		}

		case 'deletePassages': {
			const story = storyWithId(state, action.storyId);

			// See above comment about passages.

			doUpdateTransaction(transaction => {
				saveStory(transaction, story);
				action.passageIds.forEach(passageId =>
					deletePassageById(transaction, passageId)
				);
			});
			break;
		}

		case 'deleteStory': {
			// The story will be gone from state by the time we're called, so we
			// need a cached copy.

			const story = storyWithId(lastState, action.storyId);

			doUpdateTransaction(transaction => {
				// We have to delete all passages, then the story itself.

				story.passages.forEach(passage =>
					deletePassageById(transaction, passage.id)
				);

				deleteStory(transaction, story);
			});
			break;
		}

		case 'updatePassage':
			if (isPersistablePassageChange(action.props)) {
				const story = storyWithId(state, action.storyId);
				const passage = passageWithId(state, action.storyId, action.passageId);

				doUpdateTransaction(transaction => {
					saveStory(transaction, story);
					savePassage(transaction, passage);
				});
				break;
			}
			break;

		case 'updatePassages': {
			const story = storyWithId(state, action.storyId);

			doUpdateTransaction(transaction => {
				saveStory(transaction, story);
				Object.keys(action.passageUpdates)
					.filter(passageId =>
						isPersistablePassageChange(action.passageUpdates[passageId])
					)
					.forEach(passageId =>
						savePassage(
							transaction,
							passageWithId(state, action.storyId, passageId)
						)
					);
			});
			break;
		}

		case 'updateStory': {
			const story = storyWithId(state, action.storyId);

			doUpdateTransaction(transaction => {
				saveStory(transaction, story);
				story.passages.forEach(passage => savePassage(transaction, passage));
			});
			break;
		}

		default:
			console.warn(
				`Story action ${
					(action as any).type
				} has no local storage persistence handler`
			);
	}

	lastState = state;
}
