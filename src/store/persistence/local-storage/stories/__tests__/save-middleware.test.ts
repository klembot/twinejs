import {saveMiddleware} from '../save-middleware';
import {
	deletePassageById,
	deleteStory,
	doUpdateTransaction,
	savePassage,
	saveStory
} from '../save';
import {StoriesState} from '../../../../stories/stories.types';
import {fakeStory} from '../../../../../test-util';

jest.mock('../save');

describe('stories local storage save middleware', () => {
	let state: StoriesState;
	let deletePassageByIdMock = deletePassageById as jest.Mock;
	let deleteStoryMock = deleteStory as jest.Mock;
	let doUpdateTransactionMock = doUpdateTransaction as jest.Mock;
	let savePassageMock = savePassage as jest.Mock;
	let saveStoryMock = saveStory as jest.Mock;
	let warnSpy: jest.SpyInstance;

	beforeEach(() => {
		state = [fakeStory()];
		warnSpy = jest.spyOn(console, 'warn').mockReturnValue();
	});

	it('takes no action when an init action is received', () => {
		saveMiddleware(state, {type: 'init', state: []});
		expect(doUpdateTransactionMock).not.toHaveBeenCalled();
		expect(savePassageMock).not.toHaveBeenCalled();
		expect(saveStoryMock).not.toHaveBeenCalled();
	});

	it('takes no action when a repair action is received', () => {
		saveMiddleware(state, {type: 'init', state: []});
		expect(doUpdateTransactionMock).not.toHaveBeenCalled();
		expect(savePassageMock).not.toHaveBeenCalled();
		expect(saveStoryMock).not.toHaveBeenCalled();
	});

	describe('when a createPassage action is received', () => {
		it('saves the story using a transaction', () => {
			const transaction = {passageIds: '', storyIds: ''};

			saveMiddleware(state, {
				type: 'createPassage',
				props: {name: state[0].passages[0].name},
				storyId: state[0].id
			});
			expect(doUpdateTransactionMock).toHaveBeenCalledTimes(1);
			doUpdateTransactionMock.mock.calls[0][0](transaction);
			expect(savePassageMock.mock.calls).toEqual([
				[transaction, state[0].passages[0]]
			]);
			expect(saveStoryMock.mock.calls).toEqual([[transaction, state[0]]]);
		});

		it('throws an error if the passage created has no name', () =>
			expect(() =>
				saveMiddleware(state, {
					type: 'createPassage',
					props: {},
					storyId: state[0].id
				})
			).toThrow());

		it("throws an error if the story belonging to the passage doesn't exist in state", () =>
			expect(() =>
				saveMiddleware(state, {
					type: 'createPassage',
					props: state[0].passages[0],
					storyId: 'wrong'
				})
			).toThrow());

		it("throws an error if the passage doesn't exist in state", () =>
			expect(() =>
				saveMiddleware(state, {
					type: 'createPassage',
					props: {...state[0].passages[0], name: 'wrong'},
					storyId: state[0].id
				})
			).toThrow());
	});

	describe('when a createPassages action is received', () => {
		beforeEach(() => (state = [fakeStory(2)]));

		it('saves the story using a transaction', () => {
			const transaction = {passageIds: '', storyIds: ''};

			saveMiddleware(state, {
				type: 'createPassages',
				props: [
					{name: state[0].passages[0].name},
					{name: state[0].passages[1].name}
				],
				storyId: state[0].id
			});
			expect(doUpdateTransactionMock).toHaveBeenCalledTimes(1);
			doUpdateTransactionMock.mock.calls[0][0](transaction);
			expect(savePassageMock.mock.calls).toEqual([
				[transaction, state[0].passages[0]],
				[transaction, state[0].passages[1]]
			]);
			expect(saveStoryMock.mock.calls).toEqual([[transaction, state[0]]]);
		});

		it('throws an error if a passage created has no name', () => {
			const transaction = {passageIds: '', storyIds: ''};

			saveMiddleware(state, {
				type: 'createPassages',
				props: [{name: state[0].passages[0].name}, {}],
				storyId: state[0].id
			});

			expect(() =>
				doUpdateTransactionMock.mock.calls[0][0](transaction)
			).toThrow();
		});

		it("throws an error if the story belonging to a passage doesn't exist in state", () =>
			expect(() =>
				saveMiddleware(state, {
					type: 'createPassages',
					props: [state[0].passages[0]],
					storyId: 'wrong'
				})
			).toThrow());

		it("throws an error if the passage doesn't exist in state", () => {
			const transaction = {passageIds: '', storyIds: ''};

			saveMiddleware(state, {
				type: 'createPassages',
				props: [{...state[0].passages[0], name: 'wrong'}],
				storyId: state[0].id
			});

			expect(() =>
				doUpdateTransactionMock.mock.calls[0][0](transaction)
			).toThrow();
		});
	});

	describe('when a createStory action is received', () => {
		it('saves the story using a transaction', () => {
			const transaction = {passageIds: '', storyIds: ''};

			saveMiddleware(state, {
				type: 'createStory',
				props: {name: state[0].name}
			});
			expect(doUpdateTransactionMock).toHaveBeenCalledTimes(1);
			doUpdateTransactionMock.mock.calls[0][0](transaction);
			expect(savePassageMock.mock.calls).toEqual([
				[transaction, state[0].passages[0]]
			]);
			expect(saveStoryMock.mock.calls).toEqual([[transaction, state[0]]]);
		});

		it('throws an error if the story created has no name', () =>
			expect(() =>
				saveMiddleware(state, {
					type: 'createStory',
					props: {}
				})
			).toThrow());

		it("throws an error if the story doesn't exist in state", () =>
			expect(() =>
				saveMiddleware(state, {
					type: 'createStory',
					props: {name: 'bad'}
				})
			).toThrow());
	});

	describe('when a deletePassage action is received', () => {
		it('saves the story using a transaction', () => {
			const transaction = {passageIds: '', storyIds: ''};

			saveMiddleware(state, {
				type: 'deletePassage',
				passageId: state[0].passages[0].id,
				storyId: state[0].id
			});
			expect(doUpdateTransactionMock).toHaveBeenCalledTimes(1);
			doUpdateTransactionMock.mock.calls[0][0](transaction);
			expect(deletePassageByIdMock.mock.calls).toEqual([
				[transaction, state[0].passages[0].id]
			]);
			expect(saveStoryMock.mock.calls).toEqual([[transaction, state[0]]]);
		});

		it("throws an error if the story doesn't exist in state", () =>
			expect(() =>
				saveMiddleware(state, {
					type: 'deletePassage',
					passageId: state[0].passages[0].id,
					storyId: 'bad'
				})
			).toThrow());
	});

	describe('when a deletePassages action is received', () => {
		beforeEach(() => (state = [fakeStory(2)]));

		it('saves the story using a transaction', () => {
			const transaction = {passageIds: '', storyIds: ''};

			saveMiddleware(state, {
				type: 'deletePassages',
				passageIds: [state[0].passages[0].id, state[0].passages[1].id],
				storyId: state[0].id
			});
			expect(doUpdateTransactionMock).toHaveBeenCalledTimes(1);
			doUpdateTransactionMock.mock.calls[0][0](transaction);
			expect(deletePassageByIdMock.mock.calls).toEqual([
				[transaction, state[0].passages[0].id],
				[transaction, state[0].passages[1].id]
			]);
			expect(saveStoryMock.mock.calls).toEqual([[transaction, state[0]]]);
		});

		it("throws an error if the story doesn't exist in state", () =>
			expect(() =>
				saveMiddleware(state, {
					type: 'deletePassages',
					passageIds: [state[0].passages[0].id, state[0].passages[1].id],
					storyId: 'bad'
				})
			).toThrow());
	});

	describe('when a deleteStory action is received', () => {
		// We need at least one action to be seen first so that the middleware can save a cache of the state.

		beforeEach(() => {
			saveMiddleware(state, {type: 'init', state});
		});

		it('deletes the story using a transaction', () => {
			const transaction = {passageIds: '', storyIds: ''};

			saveMiddleware(state, {
				type: 'deleteStory',
				storyId: state[0].id
			});
			expect(doUpdateTransactionMock).toHaveBeenCalledTimes(1);
			doUpdateTransactionMock.mock.calls[0][0](transaction);
			expect(deletePassageByIdMock.mock.calls).toEqual([
				[transaction, state[0].passages[0].id]
			]);
			expect(deleteStoryMock.mock.calls).toEqual([[transaction, state[0]]]);
		});

		it("throws an error if the story doesn't exist in state", () =>
			expect(() =>
				saveMiddleware(state, {
					type: 'deleteStory',
					storyId: 'bad'
				})
			).toThrow());
	});

	describe('when an updatePassage action is received', () => {
		it('saves the story using a transaction', () => {
			const transaction = {passageIds: '', storyIds: ''};

			saveMiddleware(state, {
				type: 'updatePassage',
				props: {name: state[0].passages[0].name},
				passageId: state[0].passages[0].id,
				storyId: state[0].id
			});
			expect(doUpdateTransactionMock).toHaveBeenCalledTimes(1);
			doUpdateTransactionMock.mock.calls[0][0](transaction);
			expect(savePassageMock.mock.calls).toEqual([
				[transaction, state[0].passages[0]]
			]);
			expect(saveStoryMock.mock.calls).toEqual([[transaction, state[0]]]);
		});

		it('does nothing if the change is trivial', () => {
			saveMiddleware(state, {
				type: 'updatePassage',
				props: {selected: true},
				passageId: state[0].passages[0].id,
				storyId: state[0].id
			});
			expect(doUpdateTransactionMock).not.toHaveBeenCalled();
			expect(savePassageMock).not.toHaveBeenCalled();
		});

		it("throws an error if the story belonging to the passage doesn't exist in state", () =>
			expect(() =>
				saveMiddleware(state, {
					type: 'updatePassage',
					passageId: state[0].passages[0].id,
					props: state[0].passages[0],
					storyId: 'wrong'
				})
			).toThrow());

		it("throws an error if the passage doesn't exist in state", () =>
			expect(() =>
				saveMiddleware(state, {
					type: 'updatePassage',
					passageId: 'wrong',
					props: state[0].passages[0],
					storyId: state[0].id
				})
			).toThrow());
	});

	describe('when an updatePassages action is received', () => {
		beforeEach(() => (state = [fakeStory(2)]));

		it('saves the story using a transaction', () => {
			const transaction = {passageIds: '', storyIds: ''};

			saveMiddleware(state, {
				type: 'updatePassages',
				passageUpdates: {
					[state[0].passages[0].id]: {name: state[0].passages[0].name},
					[state[0].passages[1].id]: {name: state[0].passages[1].name}
				},
				storyId: state[0].id
			});
			expect(doUpdateTransactionMock).toHaveBeenCalledTimes(1);
			doUpdateTransactionMock.mock.calls[0][0](transaction);
			expect(savePassageMock.mock.calls).toEqual([
				[transaction, state[0].passages[0]],
				[transaction, state[0].passages[1]]
			]);
			expect(saveStoryMock.mock.calls).toEqual([[transaction, state[0]]]);
		});

		it('does nothing if the change is trivial', () => {
			saveMiddleware(state, {
				type: 'updatePassages',
				passageUpdates: {
					[state[0].passages[0].id]: {selected: true}
				},
				storyId: state[0].id
			});

			// This will start a transaction, but that transaction should do nothing.

			expect(savePassageMock).not.toHaveBeenCalled();
		});

		it("throws an error if the story belonging to the passages doesn't exist in state", () =>
			expect(() =>
				saveMiddleware(state, {
					type: 'updatePassages',
					passageUpdates: {
						[state[0].passages[0].id]: {name: state[0].passages[0].name},
						[state[0].passages[1].id]: {name: state[0].passages[1].name}
					},
					storyId: 'wrong'
				})
			).toThrow());

		it("throws an error if a passage doesn't exist in state", () => {
			const transaction = {passageIds: '', storyIds: ''};

			saveMiddleware(state, {
				type: 'updatePassages',
				passageUpdates: {
					[state[0].passages[0].id]: {name: state[0].passages[0].name},
					bad: {name: state[0].passages[1].name}
				},
				storyId: state[0].id
			});
			expect(doUpdateTransactionMock).toHaveBeenCalledTimes(1);
			expect(() =>
				doUpdateTransactionMock.mock.calls[0][0](transaction)
			).toThrow();
		});
	});

	describe('when an updateStory action is received', () => {
		it('saves the story and child passages using a transaction', () => {
			const transaction = {passageIds: '', storyIds: ''};

			saveMiddleware(state, {
				type: 'updateStory',
				props: {name: state[0].name},
				storyId: state[0].id
			});
			expect(doUpdateTransactionMock).toHaveBeenCalledTimes(1);
			doUpdateTransactionMock.mock.calls[0][0](transaction);
			expect(savePassageMock.mock.calls).toEqual([
				[transaction, state[0].passages[0]]
			]);
			expect(saveStoryMock.mock.calls).toEqual([[transaction, state[0]]]);
		});

		it("throws an error if the story doesn't exist in state", () =>
			expect(() =>
				saveMiddleware(state, {
					type: 'updateStory',
					props: {name: state[0].name},
					storyId: 'bad'
				})
			).toThrow());
	});

	it('logs a warning if an unexpected action is received', () => {
		saveMiddleware(state, {type: '???'} as any);
		expect(warnSpy).toHaveBeenCalledTimes(1);
		expect(doUpdateTransactionMock).not.toHaveBeenCalled();
	});
});
