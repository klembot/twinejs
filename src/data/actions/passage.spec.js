const { spy } = require('sinon');
const actions = require('./passage');

describe('passage actions module', () => {
	const props = { fake: true };
	const fakeId = 'not-a-real-id';
	let store;

	beforeEach(() => {
		store = { dispatch: spy() };
	});

	test(
        'dispatches a CREATE_PASSAGE_IN_STORY mutation with createPassage()',
        () => {
            actions.createPassage(store, fakeId, props);
            expect(store.dispatch.calledOnce).toBe(true);
            expect(store.dispatch.calledWith('CREATE_PASSAGE_IN_STORY', fakeId, props)).toBe(true);
        }
    );

	test(
        'dispatches an UPDATE_PASSAGE_IN_STORY mutation with updatePassage()',
        () => {
            actions.updatePassage(store, fakeId, fakeId, props);
            expect(store.dispatch.calledOnce).toBe(true);
            expect(store.dispatch.calledWith('UPDATE_PASSAGE_IN_STORY', fakeId, fakeId, props)).toBe(true);
        }
    );

	test(
        'dispatches a DELETE_PASSAGE_IN_STORY mutation with deletePassage()',
        () => {
            actions.deletePassage(store, fakeId, fakeId);
            expect(store.dispatch.calledOnce).toBe(true);
            expect(store.dispatch.calledWith('DELETE_PASSAGE_IN_STORY', fakeId, fakeId)).toBe(true);
        }
    );

	test(
        'requires a numeric grid size, if passed, when positioning passages()',
        () => {
            let storyStore = {
                dispatch: spy(),
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
        }
    );

	test('creates new links with createNewlyLinkedPassages()', () => {
		let storyStore = {
			dispatch: spy(),
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

		actions.createNewlyLinkedPassages(storyStore, fakeId, fakeId, '', 10);
		expect(storyStore.dispatch.calledOnce).toBe(true);

		const firstCall = storyStore.dispatch.getCall(0);

		expect(firstCall.args[0]).toBe('CREATE_PASSAGE_IN_STORY');
		expect(firstCall.args[1]).toBe(fakeId);
		expect(firstCall.args[2].name).toBe('Test 2');
	});

	test('skips old links with createNewlyLinkedPassages()', () => {
		let storyStore = {
			dispatch: spy(),
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
		expect(storyStore.dispatch.called).toBe(false);
	});

	test('updates links with changeLinksInStory()', () => {
		let storyStore = {
			dispatch: spy(),
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

		const firstCall = storyStore.dispatch.getCall(0);

		expect(firstCall.args[0]).toBe('UPDATE_PASSAGE_IN_STORY');
		expect(firstCall.args[1]).toBe(fakeId);
		expect(firstCall.args[2]).toBe(fakeId);
		expect(firstCall.args[3].text).toBe('[[Test 2 Changed]]');
	});

	test('handles regular expression characters with changeLinksInStory()', () => {
		let storyStore = {
			dispatch: spy(),
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

		const firstCall = storyStore.dispatch.getCall(0);

		expect(firstCall.args[0]).toBe('UPDATE_PASSAGE_IN_STORY');
		expect(firstCall.args[1]).toBe(fakeId);
		expect(firstCall.args[2]).toBe(fakeId);
		expect(firstCall.args[3].text).toBe('[[Changed]]');

		const secondCall = storyStore.dispatch.getCall(1);

		expect(secondCall.args[0]).toBe('UPDATE_PASSAGE_IN_STORY');
		expect(secondCall.args[1]).toBe(fakeId);
		expect(secondCall.args[2]).toBe(fakeId + '2');
		expect(secondCall.args[3].text).toBe('[[$]]');
	});

	describe('snap to grid passage positioning', () => {	
		it('snap overlapping passages to adjacent positions, when positioning passages()', () => {
			let storyStore = {
				dispatch: spy(),
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

			const firstCall = storyStore.dispatch.getCall(0);

			expect(firstCall.args[3]).to.exist;
			expect(firstCall.args[3].top).to.equal(20);
			expect(firstCall.args[3].left).to.equal(10);
	
			/* Test overlapping from slightly above */
			storyStore.state.story.stories[0].passages[0].top = 9;
	
			actions.positionPassage(storyStore, fakeId, fakeId, 10);

			const secondCall = storyStore.dispatch.getCall(1);

			expect(secondCall.args[3]).to.exist;
			expect(secondCall.args[3].top).to.equal(0);
			expect(secondCall.args[3].left).to.equal(10);
	
			/* Test overlapping from slightly leftwards */
			storyStore.state.story.stories[0].passages[0].top = 10;
			storyStore.state.story.stories[0].passages[0].left = 0;
	
			actions.positionPassage(storyStore, fakeId, fakeId, 10);

			const thirdCall = storyStore.dispatch.getCall(2);

			expect(thirdCall.args[3]).to.exist;
			expect(thirdCall.args[3].top).to.equal(10);
			expect(thirdCall.args[3].left).to.equal(0);
	
			/* Test overlapping from slightly rightwards */
			storyStore.state.story.stories[0].passages[0].left = 11;
	
			actions.positionPassage(storyStore, fakeId, fakeId, 10);

			const fourthCall = storyStore.dispatch.getCall(3);

			expect(fourthCall.args[3]).to.exist;
			expect(fourthCall.args[3].top).to.equal(10);
			expect(fourthCall.args[3].left).to.equal(20);
		});
	});
});
