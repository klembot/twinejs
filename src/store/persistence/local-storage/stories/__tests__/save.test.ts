import {
	deletePassage,
	deletePassageById,
	deleteStory,
	doUpdateTransaction,
	savePassage,
	saveStory,
	StorageTransaction
} from '../save';
import {Story} from '../../../../stories/stories.types';
import {fakeStory} from '../../../../../test-util';

describe('stories local storage save', () => {
	let story: Story;
	let transaction: StorageTransaction;

	beforeEach(() => {
		window.localStorage.clear();
		story = fakeStory(1);
		transaction = {
			passageIds: story.passages[0].id,
			storyIds: story.id
		};
		window.localStorage.setItem(
			`twine-passages-${story.passages[0].id}`,
			JSON.stringify(story.passages[0])
		);
		window.localStorage.setItem(
			`twine-stories-${story.id}`,
			JSON.stringify({...story, passages: undefined})
		);
	});
	afterAll(() => window.localStorage.clear());

	describe('doUpdateTransaction()', () => {
		it('passes a transaction object to the updater callback containing story and passage IDs in local storage', () => {
			const updater = jest.fn();

			window.localStorage.setItem('twine-passages', 'a,b,c');
			window.localStorage.setItem('twine-stories', 'd,e,f');
			doUpdateTransaction(updater);
			expect(updater.mock.calls).toEqual([
				[{passageIds: 'a,b,c', storyIds: 'd,e,f'}]
			]);
		});

		it("defaults story and passage ID lists to empty strings if they don't exist in local storage", () => {
			const updater = jest.fn();

			doUpdateTransaction(updater);
			expect(updater.mock.calls).toEqual([[{passageIds: '', storyIds: ''}]]);
		});

		it('updates local storage story and passage IDs after the updater completes', () => {
			doUpdateTransaction(transaction => {
				transaction.passageIds = 'update1,update2';
				transaction.storyIds = 'update3,update4';
			});
			expect(window.localStorage.getItem('twine-passages')).toBe(
				'update1,update2'
			);
			expect(window.localStorage.getItem('twine-stories')).toBe(
				'update3,update4'
			);
		});
	});

	describe('deletePassage()', () => {
		beforeEach(() => deletePassage(transaction, story.passages[0]));

		it('deletes the passage from local storage', () =>
			expect(
				window.localStorage.getItem(`twine-passages-${story.passages[0].id}`)
			).toBeNull());

		it('removes the passage ID from the transaction', () =>
			expect(transaction.passageIds).toBe(''));
	});

	describe('deletePassageById()', () => {
		beforeEach(() => deletePassageById(transaction, story.passages[0].id));

		it('deletes the passage from local storage', () =>
			expect(
				window.localStorage.getItem(`twine-passages-${story.passages[0].id}`)
			).toBeNull());

		it('removes the passage ID from the transaction', () =>
			expect(transaction.passageIds).toBe(''));
	});

	describe('deleteStory()', () => {
		beforeEach(() => deleteStory(transaction, story));

		it('deletes the passage from local storage', () =>
			expect(
				window.localStorage.getItem(`twine-stories-${story.id}`)
			).toBeNull());

		it('removes the story ID from the transaction', () =>
			expect(transaction.storyIds).toBe(''));

		it('takes no action related to child passages', () => {
			expect(
				window.localStorage.getItem(`twine-passages-${story.passages[0].id}`)
			).not.toBeNull();
			expect(transaction.passageIds).toBe(story.passages[0].id);
		});
	});

	describe('saveStory()', () => {
		beforeEach(() => {
			transaction.passageIds = '';
			transaction.storyIds = '';
			window.localStorage.clear();
			saveStory(transaction, story);
		});

		it('serializes the story to local storage', () =>
			expect(
				JSON.parse(window.localStorage.getItem(`twine-stories-${story.id}`)!)
			).toEqual({
				...story,
				lastUpdate: expect.any(String),
				passages: undefined
			}));

		it('adds the story ID to the transaction', () =>
			expect(transaction.storyIds).toBe(story.id));

		it('does not serialize passages to local storage', () =>
			expect(
				window.localStorage.getItem(`twine-passages-${story.passages[0].id}`)!
			).toBeNull());

		it('does not place passage IDs in the transaction', () =>
			expect(transaction.passageIds).toBe(''));
	});

	describe('savePassage()', () => {
		beforeEach(() => {
			transaction.passageIds = '';
			transaction.storyIds = '';
			window.localStorage.clear();
			savePassage(transaction, story.passages[0]);
		});

		it('serializes the passage to local storage', () =>
			expect(
				JSON.parse(
					window.localStorage.getItem(`twine-passages-${story.passages[0].id}`)!
				)
			).toEqual(story.passages[0]));

		it('adds the passage ID to the transaction', () =>
			expect(transaction.passageIds).toBe(story.passages[0].id));

		it('does not serialize the parent story to local storage', () =>
			expect(
				window.localStorage.getItem(`twine-stories-${story.id}`)!
			).toBeNull());

		it('does not place the parent story ID in the transaction', () =>
			expect(transaction.storyIds).toBe(''));
	});
});
