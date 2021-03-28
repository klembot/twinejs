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
import {doUpdateTransaction, savePassage, saveStory} from './save';

// TODO: handle passage delete, check electron side too
// TODO: handle story delete, check electron side too

/**
 * A middleware function to save changes to local storage. This should be called
 * *after* the main reducer runs.
 */
export function saveMiddleware(state: StoriesState, action: StoriesAction) {
	let passage: Passage;
	let story: Story;

	switch (action.type) {
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

		case 'createStory':
			if (!action.props.name) {
				console.warn(
					"Story was created but with no name specified, can't persist it",
					action.props
				);
				return;
			}

			const newStory = storyWithName(state, action.props.name);

			doUpdateTransaction(transaction => {
				saveStory(transaction, newStory);
				newStory.passages.forEach(passage =>
					savePassage(transaction, passage)
				);
			});
			break;

		case 'updatePassage':
			// Is this a significant update?

			if (Object.keys(action.props).some(key => key !== 'highlighted')) {
				try {
					story = storyWithId(state, action.storyId);
				} catch (e) {
					console.warn(
						`Could not find story with ID "${action.storyId}", can't persist it`
					);
					return;
				}

				try {
					passage = passageWithId(
						state,
						action.storyId,
						action.passageId
					);
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

		case 'updateStory':
			story = storyWithId(state, action.storyId);

			doUpdateTransaction(transaction => {
				saveStory(transaction, story);
				story.passages.forEach(passage =>
					savePassage(transaction, passage)
				);
			});
			break;
	}
}
