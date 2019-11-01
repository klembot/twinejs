import * as mutations from '../mutations';
import {storyDefaults} from '../defaults';

describe('story data module mutations', () => {
	let testEmptyState, testStateWithStory;

	beforeEach(() => {
		testEmptyState = {stories: []};
		testStateWithStory = {
			stories: [
				{
					id: 'test-story-id',
					name: 'Test Story',
					passages: [
						{
							id: 'test-passage-id',
							left: 100,
							name: 'Test Passage',
							text: 'test passage text',
							top: 200
						}
					]
				}
			]
		};
	});

	describe('create story mutation', () => {
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

	describe('update passage mutation', () => {
		it('updates passage properties', () => {
			mutations.updatePassage(testStateWithStory, {
				passageId: 'test-passage-id',
				passageProps: {name: 'Changed Name'},
				storyId: 'test-story-id'
			});

			expect(
				testStateWithStory.stories
					.find(s => s.id === 'test-story-id')
					.passages.find(p => p.id === 'test-passage-id').name
			).toBe('Changed Name');
		});

		it('allows partial updates', () => {
			const prevPassageTop = testStateWithStory.stories
				.find(s => s.id === 'test-story-id')
				.passages.find(p => p.id === 'test-passage-id').top;

			mutations.updatePassage(testStateWithStory, {
				passageId: 'test-passage-id',
				passageProps: {name: 'Changed Name'},
				storyId: 'test-story-id'
			});

			expect(
				testStateWithStory.stories
					.find(s => s.id === 'test-story-id')
					.passages.find(p => p.id === 'test-passage-id').top
			).toBe(prevPassageTop);
		});

		it("changes the parent story's lastUpdate property", () => {
			const prevLastUpdate = testStateWithStory.stories.find(
				s => s.id === 'test-story-id'
			).lastUpdate;

			mutations.updatePassage(testStateWithStory, {
				passageId: 'test-passage-id',
				passageProps: {name: 'Changed Name'},
				storyId: 'test-story-id'
			});

			expect(
				testStateWithStory.stories.find(s => s.id === 'test-story-id')
					.lastUpdate
			).not.toBe(prevLastUpdate);
		});
	});
});
