import {
	createNewlyLinkedPassages,
	createPassage,
	createUntitledPassage
} from '../passage-create';
import {passageDefaults} from '../../defaults';
import {fakeStoryObject} from '@/test-utils/fakes';
import {actionCommits} from '@/test-utils/vuex';

jest.mock('@/util/link-parser');

let story;
const getters = {
	storyWithId(id) {
		if (id === story.id) {
			return story;
		}
	}
};

beforeEach(() => (story = fakeStoryObject(1)));

describe('createNewlyLinkedPassages action', () => {
	it('creates passages for new links only', () => {
		story.passages[0].text = 'a b';

		const commits = actionCommits(
			createNewlyLinkedPassages,
			{
				oldText: 'a',
				passageId: story.passages[0].id,
				storyId: story.id
			},
			getters
		);

		expect(commits.length).toBe(1);
		expect(commits[0][0]).toBe('createPassage');
		expect(commits[0][1].passageProps).toMatchObject({name: 'b'});
		expect(commits[0][1].storyId).toBe(story.id);
	});

	it('does not create passages that already exist', () => {
		story.passages[0].text = 'a b';
		story.passages[1] = {name: 'b'};
		expect(
			actionCommits(
				createNewlyLinkedPassages,
				{oldText: 'a', passageId: story.passages[0].id, storyId: story.id},
				getters
			)
		).toEqual([]);
	});

	it('centers newly-created passages beneath the original one', () => {
		/* A single passage. */

		Object.assign(story.passages[0], {left: 0, text: 'a b', top: 0});

		let commits = actionCommits(
			createNewlyLinkedPassages,
			{oldText: 'a', passageId: story.passages[0].id, storyId: story.id},
			getters
		);

		expect(commits.length).toBe(1);
		expect(commits[0][0]).toBe('createPassage');
		expect(commits[0][1].passageProps).toMatchObject({
			left: 0,
			name: 'b'
		});
		expect(commits[0][1].passageProps.top).toBeGreaterThan(
			story.passages[0].top + story.passages[0].height
		);
		expect(commits[0][1].storyId).toBe(story.id);

		/* Two passages. */

		Object.assign(story.passages[0], {left: 0, text: 'a b c', top: 0});
		commits = actionCommits(
			createNewlyLinkedPassages,
			{oldText: 'a', passageId: story.passages[0].id, storyId: story.id},
			getters
		);

		expect(commits.length).toBe(2);
		expect(commits[0][0]).toBe('createPassage');
		expect(commits[0][1].storyId).toBe(story.id);
		expect(commits[1][0]).toBe('createPassage');
		expect(commits[1][1].storyId).toBe(story.id);

		const firstProps = commits[0][1].passageProps;
		const secondProps = commits[1][1].passageProps;

		expect(firstProps.top).toBeGreaterThan(
			story.passages[0].top + story.passages[0].height
		);
		expect(secondProps.top).toBeGreaterThan(
			story.passages[0].top + story.passages[0].height
		);
		expect(firstProps.top).toBe(secondProps.top);

		const origCenter = story.passages[0].left + story.passages[0].width / 2;
		const left = firstProps.left;
		const right =
			secondProps.left + (secondProps.width || passageDefaults.width);

		expect(origCenter - left).toBe(right - origCenter);
	});

	it.todo('puts space between the newly-created passages');

	it('throws an error if the previous text is not a string', () => {
		expect(() =>
			actionCommits(
				createNewlyLinkedPassages,
				{
					oldText: 0,
					passageId: story.passages[0].id,
					storyId: story.id + 'nonexistent'
				},
				getters
			)
		).toThrow();
		expect(() =>
			actionCommits(
				createNewlyLinkedPassages,
				{
					oldText: undefined,
					passageId: story.passages[0].id,
					storyId: story.id + 'nonexistent'
				},
				getters
			)
		).toThrow();
	});

	it('throws an error if there is no story with the given ID in state', () =>
		expect(() =>
			actionCommits(
				createNewlyLinkedPassages,
				{
					oldText: 'a',
					passageId: story.passages[0].id,
					storyId: story.id + 'nonexistent'
				},
				getters
			)
		).toThrow());

	it('throws an error if there is no passage with the given ID in the story', () =>
		expect(() =>
			actionCommits(
				createNewlyLinkedPassages,
				{
					oldText: 'a',
					passageId: story.passages[0].id + 'nonexistent',
					storyId: story.id
				},
				getters
			)
		).toThrow());
});

describe('createPassage action', () => {
	it('creates a passage with props provided', () => {
		const passageProps = {name: 'test'};

		expect(
			actionCommits(createPassage, {passageProps, storyId: story.id}, getters)
		).toEqual([['createPassage', {passageProps, storyId: story.id}]]);
	});

	it("throws an error if there's already a passage with the given name", () => {
		expect(() =>
			actionCommits(
				createPassage,
				{
					passageProps: {name: story.passages[0].name},
					storyId: story.id + 'nonexistent'
				},
				getters
			)
		).toThrow();
	});

	it('throws an error if there is no story with the given ID in state', () => {
		expect(() =>
			actionCommits(
				createPassage,
				{passageProps: {}, storyId: story.id + 'nonexistent'},
				getters
			)
		).toThrow();
	});
});

describe('createUntitledPassage action', () => {
	it('creates a passage centered at the position given', () => {
		const commits = actionCommits(
			createUntitledPassage,
			{centerX: 100, centerY: 50, storyId: story.id},
			getters
		);

		expect(commits.length).toBe(1);
		expect(commits[0][0]).toBe('createPassage');
		expect(commits[0][1].storyId).toBe(story.id);
		expect(commits[0][1].passageProps).toEqual(
			expect.objectContaining({
				left: 100 - passageDefaults.width / 2,
				top: 50 - passageDefaults.height / 2
			})
		);
	});

	it.todo(
		'incrementally adds numbers to the end of the passage name until a unique one is found'
	);

	it.todo('moves the passage to avoid overlaps with existing ones');

	it('throws an error if the center position properties are not numbers', () => {
		expect(() =>
			actionCommits(
				createUntitledPassage,
				{centerX: 'a', centerY: 0, storyId: story.id},
				getters
			)
		).toThrow();
		expect(() =>
			actionCommits(
				createUntitledPassage,
				{centerX: undefined, centerY: 0, storyId: story.id},
				getters
			)
		).toThrow();
		expect(() =>
			actionCommits(
				createUntitledPassage,
				{centerX: 0, centerY: 'a', storyId: story.id},
				getters
			)
		).toThrow();
		expect(() =>
			actionCommits(
				createUntitledPassage,
				{centerX: 0, centerY: undefined, storyId: story.id},
				getters
			)
		).toThrow();
	});

	it('throws an error if there is no story with the given ID in state', () => {
		expect(() =>
			actionCommits(
				createUntitledPassage,
				{centerX: 0, centerY: 0, storyId: story.id + 'nonexistent'},
				getters
			)
		).toThrow();
	});
});
