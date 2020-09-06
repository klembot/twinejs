import {fakeStoryObject} from '@/test-utils/fakes';
import * as mutations from '../mutations';
import {storyDefaults} from '../defaults';

describe('story data module mutations', () => {
	let testEmptyState, testStateWithStory;

	beforeEach(() => {
		testEmptyState = {stories: []};
		testStateWithStory = {
			stories: [fakeStoryObject(1)]
		};
	});

	describe('createStory', () => {
		it('creates a story', () => {
			const storyProps = {name: 'Test Story'};

			mutations.createStory(testEmptyState, {storyProps});
			expect(testEmptyState.stories.length).toBe(1);
			expect(testEmptyState.stories[0]).toMatchObject(storyProps);
		});

		it('assigns a UUID id to a story if not specified', () => {
			const storyProps = {name: 'Test Story'};

			mutations.createStory(testEmptyState, {storyProps});
			expect(testEmptyState.stories.length).toBe(1);
			expect(typeof testEmptyState.stories[0].id).toBe('string');
		});

		it('assigns an IFID to a story if not specified', () => {
			const storyProps = {name: 'Test Story'};

			mutations.createStory(testEmptyState, {storyProps});
			expect(testEmptyState.stories.length).toBe(1);
			expect(typeof testEmptyState.stories[0].ifid).toBe('string');

			/*
			See http://babel.ifarchive.org/babel_rev9.txt
			*/

			expect(testEmptyState.stories[0].ifid.length).toBeGreaterThanOrEqual(8);
			expect(testEmptyState.stories[0].ifid.length).toBeLessThanOrEqual(63);
			expect(/^(\d|-|[A-Z])+$/.test(testEmptyState.stories[0].ifid)).toBe(true);
		});

		it('uses the ID and IFID if specified', () => {
			const storyProps = {id: 'test-id', ifid: 'test-ifid', name: 'Test Story'};

			mutations.createStory(testEmptyState, {storyProps});
			expect(testEmptyState.stories.length).toBe(1);
			expect(testEmptyState.stories[0].ifid).toBe(storyProps.ifid);
			expect(testEmptyState.stories[0].id).toBe(storyProps.id);
		});

		it('uses defaults where properties are not specified', () => {
			mutations.createStory(testEmptyState, {});
			expect(testEmptyState.stories.length).toBe(1);
			expect(testEmptyState.stories[0]).toMatchObject(storyDefaults);
		});

		it('forces stories to have a passages property', () => {
			mutations.createStory(testEmptyState, {});
			expect(testEmptyState.stories.length).toBe(1);
			expect(testEmptyState.stories[0].passages.length).toBe(0);
		});

		it('links passages to their parent by default', () => {
			mutations.createStory(testEmptyState, {
				storyProps: {
					name: 'Test Story',
					passages: [{name: 'Test Passage'}]
				}
			});
			expect(testEmptyState.stories.length).toBe(1);
			expect(testEmptyState.stories[0].passages[0].story).toBe(
				testEmptyState.stories[0].id
			);
		});

		it('links passages to their parent even when ID is mis-set', () => {
			mutations.createStory(testEmptyState, {
				storyProps: {
					name: 'Test Story',
					passages: [{name: 'Test Passage', story: 'test-story-id'}]
				}
			});
			expect(testEmptyState.stories.length).toBe(1);
			expect(testEmptyState.stories[0].passages[0].story).toBe(
				testEmptyState.stories[0].id
			);
		});

		it('links passages to their parent when a specific ID was requested', () => {
			mutations.createStory(testEmptyState, {
				storyProps: {
					id: 'test-story-id',
					name: 'Test Story',
					passages: [{name: 'Test Passage', story: 'not-test-story-id'}]
				}
			});
			expect(testEmptyState.stories.length).toBe(1);
			expect(testEmptyState.stories[0].passages[0].story).toBe(
				testEmptyState.stories[0].id
			);
		});
	});

	describe('updateStory', () => {
		it('updates story properties', () => {
			const story = testStateWithStory.stories[0];
			const newName = story.name + 'changed';

			mutations.updateStory(testStateWithStory, {
				storyId: testStateWithStory.stories[0].id,
				storyProps: {name: newName}
			});
			expect(testStateWithStory.stories[0].name).toBe(newName);
		});

		it('always changes the lastUpdate property', () => {
			const story = testStateWithStory.stories[0];
			const oldDate = story.lastUpdate;

			mutations.updateStory(testStateWithStory, {
				storyId: story.id,
				storyProps: {}
			});
			expect(testStateWithStory.stories[0].lastUpdate).not.toBe(oldDate);
		});

		it("warns if the storyId doesn't match an existing one but doesn't throw an error", () => {
			const oldWarn = global.console.warn;

			global.console.warn = jest.fn();
			mutations.updateStory(testStateWithStory, {
				storyId: testStateWithStory.stories[0].id + 'nonexistent',
				storyProps: {}
			});
			expect(global.console.warn).toHaveBeenCalledTimes(1);
			global.console.warn = oldWarn;
		});

		it.todo('does not affect other stories');
	});

	describe('deleteStory', () => {
		it('deletes a story', () => {
			mutations.deleteStory(testStateWithStory, {
				storyId: testStateWithStory.stories[0].id
			});
			expect(testStateWithStory.stories.length).toBe(0);
		});

		it("warns if the storyId doesn't match an existing one but doesn't throw an error", () => {
			const oldWarn = global.console.warn;

			global.console.warn = jest.fn();
			mutations.deleteStory(testStateWithStory, {
				storyId: testStateWithStory.stories[0].id + 'nonexistent'
			});
			expect(global.console.warn).toHaveBeenCalledTimes(1);
			global.console.warn = oldWarn;
		});

		it.todo('does not affect other stories');
	});

	describe('createPassage', () => {
		it('creates a passage', () => {
			const story = testStateWithStory.stories[0];

			mutations.createPassage(testStateWithStory, {
				passageProps: {name: 'new passage'},
				storyId: story.id
			});
			expect(testStateWithStory.stories[0].passages.length).toBe(2);
			expect(testStateWithStory.stories[0].passages[1].name).toBe(
				'new passage'
			);
		});

		it('defaults the new passage to the starting one if it is the first', () => {
			const story = testStateWithStory.stories[0];

			story.passages = [];
			mutations.createPassage(testStateWithStory, {
				passageProps: {name: 'new passage'},
				storyId: story.id
			});
			expect(testStateWithStory.stories[0].startPassage).toBe(
				testStateWithStory.stories[0].passages[0].id
			);
		});

		it("changes the parent story's lastUpdate property", () => {
			const story = testStateWithStory.stories[0];
			const prevLastUpdate = story.lastUpdate;

			mutations.createPassage(testStateWithStory, {
				passageProps: {name: 'new passage'},
				storyId: story.id
			});
			expect(testStateWithStory.stories[0].lastUpdate).not.toBe(prevLastUpdate);
		});

		it("warns if the storyId doesn't match an existing one but doesn't throw an error", () => {
			const oldWarn = global.console.warn;

			global.console.warn = jest.fn();
			mutations.createPassage(testStateWithStory, {
				passageProps: {},
				storyId: testStateWithStory.stories[0].id + 'nonexistent'
			});
			expect(global.console.warn).toHaveBeenCalledTimes(1);
			global.console.warn = oldWarn;
		});

		it.todo('does not affect other stories');
	});

	describe('updatePassage', () => {
		it('updates passage properties', () => {
			const story = testStateWithStory.stories[0];
			const newName = story.passages[0].name + 'changed';

			mutations.updatePassage(testStateWithStory, {
				passageId: story.passages[0].id,
				passageProps: {name: newName},
				storyId: story.id
			});
			expect(testStateWithStory.stories[0].passages[0].name).toBe(newName);
		});

		it('allows partial updates', () => {
			const story = testStateWithStory.stories[0];
			const prevPassageTop = story.passages[0].top;

			mutations.updatePassage(testStateWithStory, {
				passageId: story.passages[0].id,
				passageProps: {name: 'Changed Name'},
				storyId: story.id
			});
			expect(testStateWithStory.stories[0].passages[0].top).toBe(
				prevPassageTop
			);
		});

		it("changes the parent story's lastUpdate property", () => {
			const story = testStateWithStory.stories[0];
			const prevLastUpdate = story.lastUpdate;

			mutations.updatePassage(testStateWithStory, {
				passageId: story.passages[0].id,
				passageProps: {name: 'Changed Name'},
				storyId: story.id
			});
			expect(testStateWithStory.stories[0].lastUpdate).not.toBe(prevLastUpdate);
		});

		it("warns if the storyId doesn't match an existing one but doesn't throw an error", () => {
			const oldWarn = global.console.warn;

			global.console.warn = jest.fn();
			mutations.updatePassage(testStateWithStory, {
				passageId: testStateWithStory.stories[0].passages[0].id,
				passageProps: {},
				storyId: testStateWithStory.stories[0].id + 'nonexistent'
			});
			expect(global.console.warn).toHaveBeenCalledTimes(1);
			global.console.warn = oldWarn;
		});

		it("warns if the passageId doesn't match an existing one but doesn't throw an error", () => {
			const oldWarn = global.console.warn;

			global.console.warn = jest.fn();
			mutations.updatePassage(testStateWithStory, {
				passageId: testStateWithStory.stories[0].passages[0].id + 'nonexistent',
				passageProps: {},
				storyId: testStateWithStory.stories[0].id
			});
			expect(global.console.warn).toHaveBeenCalledTimes(1);
			global.console.warn = oldWarn;
		});

		it.todo('does not affect other stories');
	});

	describe('deletePassage', () => {
		it('deletes a passage', () => {
			const story = testStateWithStory.stories[0];

			mutations.deletePassage(testStateWithStory, {
				passageId: story.passages[0].id,
				storyId: story.id
			});
			expect(testStateWithStory.stories[0].passages).toEqual([]);
		});

		it("changes the parent story's lastUpdate property", () => {
			const story = testStateWithStory.stories[0];
			const prevLastUpdate = story.lastUpdate;

			mutations.updatePassage(testStateWithStory, {
				passageId: story.passages[0].id,
				passageProps: {name: 'Changed Name'},
				storyId: story.id
			});
			expect(testStateWithStory.stories[0].lastUpdate).not.toBe(prevLastUpdate);
		});

		it("warns if the storyId doesn't match an existing one but doesn't throw an error", () => {
			const oldWarn = global.console.warn;

			global.console.warn = jest.fn();
			mutations.deletePassage(testStateWithStory, {
				passageId: testStateWithStory.stories[0].passages[0].id,
				storyId: testStateWithStory.stories[0].id + 'nonexistent'
			});
			expect(global.console.warn).toHaveBeenCalledTimes(1);
			global.console.warn = oldWarn;
		});

		it("warns if the passageId doesn't match an existing one but doesn't throw an error", () => {
			const oldWarn = global.console.warn;

			global.console.warn = jest.fn();
			mutations.deletePassage(testStateWithStory, {
				passageId: testStateWithStory.stories[0].passages[0].id + 'nonexistent',
				storyId: testStateWithStory.stories[0].id
			});
			expect(global.console.warn).toHaveBeenCalledTimes(1);
			global.console.warn = oldWarn;
		});

		it.todo('does not affect other stories');
	});

	it.todo('cleans up passages and stories throughout');
});
