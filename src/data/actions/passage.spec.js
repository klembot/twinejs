import actions from './passage';

describe('passage actions module', () => {
	const props = {fake: true};
	const fakeId = 'not-a-real-id';
	let store;

	beforeEach(() => {
		store = {dispatch: jest.fn()};
	});

	test('dispatches a CREATE_PASSAGE_IN_STORY mutation with createPassage()', () => {
		actions.createPassage(store, fakeId, props);
		expect(store.dispatch).toBeCalledTimes(1);
		expect(store.dispatch).toHaveBeenCalledWith(
			'CREATE_PASSAGE_IN_STORY',
			fakeId,
			props
		);
	});

	test('dispatches an UPDATE_PASSAGE_IN_STORY mutation with updatePassage()', () => {
		actions.updatePassage(store, fakeId, fakeId, props);
		expect(store.dispatch).toHaveBeenCalledTimes(1);
		expect(store.dispatch).toHaveBeenCalledWith(
			'UPDATE_PASSAGE_IN_STORY',
			fakeId,
			fakeId,
			props
		);
	});

	test('dispatches a DELETE_PASSAGE_IN_STORY mutation with deletePassage()', () => {
		actions.deletePassage(store, fakeId, fakeId);
		expect(store.dispatch).toHaveBeenCalledTimes(1);
		expect(store.dispatch).toHaveBeenCalledWith(
			'DELETE_PASSAGE_IN_STORY',
			fakeId,
			fakeId
		);
	});

	test('requires a numeric grid size, if passed, when positioning passages()', () => {
		let storyStore = {
			dispatch: jest.fn(),
			state: {
				story: {
					stories: [
						{
							id: fakeId,
							passages: [
								{
									id: fakeId,
									name: 'Test',
									text: 'a',
									left: 10,
									top: 10
								}
							]
						}
					]
				}
			}
		};

		/* Test non-numeric argument. */

		expect(() =>
			actions.positionPassage(storyStore, fakeId, fakeId, 'a')
		).toThrowError();

		/* Test undefined argument. */

		actions.positionPassage(storyStore, fakeId, fakeId);
		expect(storyStore.state.story.stories[0].passages[0].left).toBe(10);
		expect(storyStore.state.story.stories[0].passages[0].top).toBe(10);

		/* Test null argument. */

		actions.positionPassage(storyStore, fakeId, fakeId, null);
		expect(storyStore.state.story.stories[0].passages[0].left).toBe(10);
		expect(storyStore.state.story.stories[0].passages[0].top).toBe(10);
	});

	test('creates new links with createNewlyLinkedPassages()', () => {
		let storyStore = {
			dispatch: jest.fn(),
			state: {
				story: {
					stories: [
						{
							id: fakeId,
							passages: [
								{
									id: fakeId,
									name: 'Test',
									text: '[[Test 2]]',
									left: 0,
									top: 0
								}
							]
						}
					]
				}
			}
		};

		actions.createNewlyLinkedPassages(storyStore, fakeId, fakeId, '', 10);
		expect(storyStore.dispatch).toHaveBeenCalledTimes(1);
		expect(storyStore.dispatch).toHaveBeenCalledWith(
			'CREATE_PASSAGE_IN_STORY',
			fakeId,
			{name: 'Test 2', left: 0, top: 150}
		);
	});

	test('skips old links with createNewlyLinkedPassages()', () => {
		let storyStore = {
			dispatch: jest.fn(),
			state: {
				story: {
					stories: [
						{
							id: fakeId,
							passages: [
								{
									id: fakeId,
									name: 'Test',
									text: '[[Test 2]]'
								}
							]
						}
					]
				}
			}
		};

		actions.createNewlyLinkedPassages(storyStore, fakeId, fakeId, '[[Test 2]]');
		expect(storyStore.dispatch).not.toHaveBeenCalled();
	});

	test('updates links with changeLinksInStory()', () => {
		let storyStore = {
			dispatch: jest.fn(),
			state: {
				story: {
					stories: [
						{
							id: fakeId,
							passages: [
								{
									id: fakeId,
									name: 'Test',
									text: '[[Test 2]]'
								}
							]
						}
					]
				}
			}
		};

		actions.changeLinksInStory(storyStore, fakeId, 'Test 2', 'Test 2 Changed');

		expect(storyStore.dispatch).toHaveBeenCalledWith(
			'UPDATE_PASSAGE_IN_STORY',
			fakeId,
			fakeId,
			{text: '[[Test 2 Changed]]'}
		);
	});

	test('handles regular expression characters with changeLinksInStory()', () => {
		let storyStore = {
			dispatch: jest.fn(),
			state: {
				story: {
					stories: [
						{
							id: fakeId,
							passages: [
								{
									id: fakeId,
									name: 'Test',
									text: '[[.]]'
								},
								{
									id: fakeId + '2',
									name: 'Test 2',
									text: '[[2]]'
								}
							]
						}
					]
				}
			}
		};

		actions.changeLinksInStory(storyStore, fakeId, '.', 'Changed');
		actions.changeLinksInStory(storyStore, fakeId, '2', '$');

		expect(storyStore.dispatch).toHaveBeenNthCalledWith(
			1,
			'UPDATE_PASSAGE_IN_STORY',
			fakeId,
			fakeId,
			{text: '[[Changed]]'}
		);
		expect(storyStore.dispatch).toHaveBeenNthCalledWith(
			2,
			'UPDATE_PASSAGE_IN_STORY',
			fakeId,
			fakeId + '2',
			{text: '[[$]]'}
		);
	});

	describe('snap to grid passage positioning', () => {
		it('snap overlapping passages to adjacent positions, when positioning passages()', () => {
			let storyStore = {
				dispatch: jest.fn(),
				state: {
					story: {
						stories: [
							{
								id: fakeId,
								snapToGrid: true,
								passages: [
									{
										id: fakeId,
										name: 'Test',
										text: 'a',
										left: 10,
										top: 10,
										width: 10,
										height: 10,
										selected: true
									},
									{
										id: fakeId + '2',
										name: 'Test',
										text: 'a',
										left: 10,
										top: 10,
										width: 10,
										height: 10,
										selected: false
									}
								]
							}
						]
					}
				}
			};

			/* Test overlapping from slightly below */
			storyStore.state.story.stories[0].passages[0].top = 11;

			actions.positionPassage(storyStore, fakeId, fakeId, 10);

			const firstCall = storyStore.dispatch.mock.calls[0];

			expect(firstCall[3].top).toEqual(20);
			expect(firstCall[3].left).toEqual(10);

			/* Test overlapping from slightly above */
			storyStore.state.story.stories[0].passages[0].top = 9;

			actions.positionPassage(storyStore, fakeId, fakeId, 10);

			const secondCall = storyStore.dispatch.mock.calls[1];

			expect(secondCall[3].top).toEqual(0);
			expect(secondCall[3].left).toEqual(10);

			/* Test overlapping from slightly leftwards */
			storyStore.state.story.stories[0].passages[0].top = 10;
			storyStore.state.story.stories[0].passages[0].left = 1;

			actions.positionPassage(storyStore, fakeId, fakeId, 10);

			const thirdCall = storyStore.dispatch.mock.calls[2];

			expect(thirdCall[3].top).toEqual(10);
			expect(thirdCall[3].left).toEqual(0);

			/* Test overlapping from slightly rightwards */
			storyStore.state.story.stories[0].passages[0].left = 11;

			actions.positionPassage(storyStore, fakeId, fakeId, 10);

			const fourthCall = storyStore.dispatch.mock.calls[3];

			expect(fourthCall[3].top).toEqual(10);
			expect(fourthCall[3].left).toEqual(20);
		});
	});
});
