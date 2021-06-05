import {
	Passage,
	passageWithId,
	passageWithName,
	StoriesAction,
	StoriesState,
	Story,
	storyWithId,
	storyWithName
} from '../../../stories';
import {
	deletePassageById,
	deleteStory,
	doUpdateTransaction,
	savePassage,
	saveStory
} from './save';

/**
 * Is a passage change persistable? e.g. is it nontrivial?
 */
function isPersistablePassageUpdate(props: Partial<Passage>) {
	return Object.keys(props).some(key => key !== 'highlighted');
}

let lastState: StoriesState;

/**
 * A middleware function to save changes to local storage. This should be called
 * *after* the main reducer runs.
 */
export function saveMiddleware(state: StoriesState, action: StoriesAction) {
	let passage: Passage;
	let story: Story;

	switch (action.type) {
		case 'init':
		case 'repair':
			// We take no action here on a repair action. This is to prevent messing up a
			// story's last modified date. If the user then edits the story, we'll save
			// their change and the repair then.
			break;

		case 'createPassage':
			if (!action.props.name) {
				console.warn(
					"Passage was created but with no name specified, can't persist it",
					action.props
				);
				return;
			}

			try {
				story = storyWithId(state, action.storyId);
			} catch (e) {
				console.warn(
					`Could not find story with ID "${action.storyId}", can't persist it`
				);
				return;
			}

			try {
				passage = passageWithName(state, story.id, action.props.name);
			} catch (e) {
				console.warn(
					`Could not find a passage with name "${action.props.name}" in story with ID "${story.id}", can't persist it`
				);
				return;
			}

			doUpdateTransaction(transaction => {
				saveStory(transaction, story);
				savePassage(transaction, passage);
			});
			break;

		case 'createPassages':
			try {
				story = storyWithId(state, action.storyId);
			} catch (e) {
				console.warn(
					`Could not find story with ID "${action.storyId}", can't persist it`
				);
				return;
			}

			doUpdateTransaction(transaction => {
				saveStory(transaction, story);
				action.props.forEach(props => {
					if (!props.name) {
						console.warn(
							"Passage was created but with no name specified, can't persist it",
							action.props
						);
						return;
					}

					try {
						passage = passageWithName(state, story.id, props.name);
					} catch (e) {
						console.warn(
							`Could not find a passage with name "${props.name}" in story with ID "${story.id}", can't persist it`
						);
						return;
					}

					savePassage(transaction, passage);
				});
			});
			break;

		case 'createStory':
			if (!action.props.name) {
				console.warn(
					"Story was created but with no name specified, can't persist it",
					action.props
				);
				return;
			}

			let newStory: Story;

			try {
				newStory = storyWithName(state, action.props.name);
			} catch (e) {
				console.warn(
					`Could not find story with name "${action.props.name}", can't persist it`
				);
				return;
			}

			doUpdateTransaction(transaction => {
				saveStory(transaction, newStory);
				newStory.passages.forEach(passage => savePassage(transaction, passage));
			});
			break;

		case 'deletePassage':
			try {
				story = storyWithId(state, action.storyId);
			} catch (e) {
				console.warn(
					`Could not find story with ID "${action.storyId}", can't persist it`
				);
				return;
			}
			// We can't dig up the passage in question right now, because
			// previousStories is only a shallow copy, and it's gone there at
			// this point in time.

			doUpdateTransaction(transaction => {
				saveStory(transaction, story);
				deletePassageById(transaction, action.passageId);
			});
			break;

		case 'deletePassages':
			try {
				story = storyWithId(state, action.storyId);
			} catch (e) {
				console.warn(
					`Could not find story with ID "${action.storyId}", can't persist it`
				);
				return;
			}

			// See above comment about passages.

			doUpdateTransaction(transaction => {
				saveStory(transaction, story);
				action.passageIds.forEach(passageId =>
					deletePassageById(transaction, passageId)
				);
			});
			break;

		case 'deleteStory':
			try {
				// The story will be gone from state by the time we're called, so we
				// need a cached copy.

				story = storyWithId(lastState, action.storyId);
			} catch (e) {
				console.warn(
					`Could not find story with ID "${action.storyId}", can't persist it`
				);
				return;
			}

			doUpdateTransaction(transaction => {
				// We have to delete all passages, then the story itself.

				story.passages.forEach(story =>
					deletePassageById(transaction, passage.id)
				);

				deleteStory(transaction, story);
			});
			break;

		case 'updatePassage':
			if (isPersistablePassageUpdate(action.props)) {
				try {
					story = storyWithId(state, action.storyId);
				} catch (e) {
					console.warn(
						`Could not find story with ID "${action.storyId}", can't persist it`
					);
					return;
				}

				try {
					passage = passageWithId(state, action.storyId, action.passageId);
				} catch (e) {
					console.warn(
						`Could not find a passage with ID "${action.passageId}" in story with ID "${story.id}", can't persist it`
					);
					return;
				}

				doUpdateTransaction(transaction => {
					saveStory(transaction, story);
					savePassage(transaction, passage);
				});
				break;
			}
			break;

		case 'updatePassages':
			try {
				story = storyWithId(state, action.storyId);
			} catch (e) {
				console.warn(
					`Could not find story with ID "${action.storyId}", can't persist it`
				);
				return;
			}

			doUpdateTransaction(transaction => {
				saveStory(transaction, story);
				Object.keys(action.passageUpdates)
					.filter(passageId =>
						isPersistablePassageUpdate(action.passageUpdates[passageId])
					)
					.forEach(passageId => {
						try {
							passage = passageWithId(state, action.storyId, passageId);
						} catch (e) {
							console.warn(
								`Could not find a passage with ID "${passageId}" in story with ID "${story.id}", can't persist it`
							);
							return;
						}

						savePassage(transaction, passage);
					});
			});
			break;

		case 'updateStory':
			try {
				story = storyWithId(state, action.storyId);
			} catch (e) {
				console.warn(
					`Could not find story with ID "${action.storyId}", can't persist it`
				);
				return;
			}

			doUpdateTransaction(transaction => {
				saveStory(transaction, story);
				story.passages.forEach(passage => savePassage(transaction, passage));
			});
			break;

		default:
			console.warn(
				`Story action ${
					(action as any).type
				} has no local storage persistence handler`
			);
	}

	lastState = state;
}
