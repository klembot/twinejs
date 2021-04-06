// Functions for moving stories into local storage. This module in particular
// needs to remain well-optimized, as it has a direct effect on load time. As a
// result, saving requires that you start and end a transaction manually. This
// minimizes the number of writes to local storage.

import {Passage, Story} from '../../../stories/stories.types';
import {addUnique, remove} from '../comma-list';

export interface StorageTransaction {
	passageIds: string;
	storyIds: string;
}

export type StorageUpdater = (transaction: StorageTransaction) => void;

/**
 * A wrapper for a series of save/delete operations. This takes a function as
 * argument that will receive an object keeping track of the transaction. This
 * function should then make save and delete calls as necessary, passing the
 * provided transaction object as their first argument.
 */
export function doUpdateTransaction(updater: StorageUpdater) {
	const transaction = {
		passageIds: window.localStorage.getItem('twine-passages') ?? '',
		storyIds: window.localStorage.getItem('twine-stories') ?? ''
	};

	updater(transaction);

	window.localStorage.setItem('twine-stories', transaction.storyIds);
	window.localStorage.setItem('twine-passages', transaction.passageIds);
}

/**
 * Saves a story to local storage. This does *not* affect any child passages.
 **/
export function saveStory(transaction: StorageTransaction, story: Story) {
	if (!story.id) {
		throw new Error('Story has no ID');
	}

	transaction.storyIds = addUnique(transaction.storyIds, story.id);

	// We have to remove the passages property before serializing the story,
	// as those are serialized under separate keys.

	window.localStorage.setItem(
		`twine-stories-${story.id}`,
		JSON.stringify({...story, passages: undefined})
	);
}

/**
 * Deletes a story from local storage. This does *not* affect any child
 * passages. You *must* delete child passages manually.
 */
export function deleteStory(transaction: StorageTransaction, story: Story) {
	if (!story.id) {
		throw new Error('Story has no ID');
	}

	transaction.storyIds = remove(transaction.storyIds, story.id);
	window.localStorage.removeItem(`twine-stories-${story.id}`);
}

/**
 * Saves a passage to local storage.
 */
export function savePassage(transaction: StorageTransaction, passage: Passage) {
	if (!passage.id) {
		throw new Error('Passage has no ID');
	}

	transaction.passageIds = addUnique(transaction.passageIds, passage.id);
	window.localStorage.setItem(
		`twine-passages-${passage.id}`,
		JSON.stringify(passage)
	);
}

/**
 * Deletes a passage from local storage.
 */
export function deletePassage(
	transaction: StorageTransaction,
	passage: Passage
) {
	if (!passage.id) {
		throw new Error('Passage has no ID');
	}

	deletePassageById(transaction, passage.id);
}

/**
 * Deletes a passage from local storage by ID only.
 */
export function deletePassageById(
	transaction: StorageTransaction,
	passageId: string
) {
	transaction.passageIds = remove(transaction.passageIds, passageId);
	window.localStorage.removeItem(`twine-passages-${passageId}`);
}
