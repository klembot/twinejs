import {
	deselectAllPassages,
	selectAllPassages,
	selectPassage,
	selectPassagesInRect
} from '../passage-select';
import {fakeStoryObject} from '@/test-utils/fakes';
import {actionCommits} from '@/test-utils/vuex';

describe('deselectAllPassages action', () => {
	const story = fakeStoryObject(3);
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};

	it('commits updatePassage mutations for any selected passages', () => {
		story.passages[0].selected = true;
		story.passages[1].selected = false;
		story.passages[2].selected = true;
		expect(
			actionCommits(deselectAllPassages, {storyId: story.id}, getters)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[0].id,
					passageProps: {selected: false},
					storyId: story.id
				}
			],
			[
				'updatePassage',
				{
					passageId: story.passages[2].id,
					passageProps: {selected: false},
					storyId: story.id
				}
			]
		]);
	});

	it('throws an error if there is no story with the given ID in state', () =>
		expect(() =>
			actionCommits(
				deselectAllPassages,
				{storyId: story.id + 'nonexistent'},
				getters
			)
		).toThrow());
});

describe('selectAllPassages action', () => {
	const story = fakeStoryObject(3);
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};

	it('commits updatePassage mutations for any selected passages', () => {
		story.passages[0].selected = false;
		story.passages[1].selected = true;
		story.passages[2].selected = false;
		expect(
			actionCommits(selectAllPassages, {storyId: story.id}, getters)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[0].id,
					passageProps: {selected: true},
					storyId: story.id
				}
			],
			[
				'updatePassage',
				{
					passageId: story.passages[2].id,
					passageProps: {selected: true},
					storyId: story.id
				}
			]
		]);
	});

	it('throws an error if there is no story with the given ID in state', () =>
		expect(() =>
			actionCommits(
				selectAllPassages,
				{storyId: story.id + 'nonexistent'},
				getters
			)
		).toThrow());
});

describe('selectPassage action', () => {
	const story = fakeStoryObject(3);
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};

	it('only selects the passage requested if the exclusive argument is false', () => {
		story.passages[0].selected = false;
		story.passages[1].selected = true;
		story.passages[2].selected = false;
		expect(
			actionCommits(
				selectPassage,
				{exclusive: false, passageId: story.passages[0].id, storyId: story.id},
				getters
			)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[0].id,
					passageProps: {selected: true},
					storyId: story.id
				}
			]
		]);
	});

	it('does nothing if the passage is already selected and the exclusive argument is false', () => {
		story.passages[0].selected = true;
		expect(
			actionCommits(
				selectPassage,
				{exclusive: false, passageId: story.passages[0].id, storyId: story.id},
				getters
			)
		).toEqual([]);
	});

	it('deselects other passages if the exclusive argument is true', () => {
		story.passages[0].selected = false;
		story.passages[1].selected = true;
		story.passages[2].selected = true;

		const commits = actionCommits(
			selectPassage,
			{exclusive: true, passageId: story.passages[0].id, storyId: story.id},
			getters
		);

		expect(commits.length).toBe(3);

		story.passages.forEach(p =>
			expect(commits).toContainEqual([
				'updatePassage',
				{
					passageId: p.id,
					passageProps: {selected: !p.selected},
					storyId: story.id
				}
			])
		);
	});

	it('deselects other passages if the exclusive argument is true, even if the passage is already selected', () => {
		story.passages[0].selected = true;
		story.passages[1].selected = true;
		story.passages[2].selected = true;
		expect(
			actionCommits(
				selectPassage,
				{
					exclusive: true,
					passageId: story.passages[0].id,
					storyId: story.id
				},
				getters
			)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[1].id,
					passageProps: {selected: false},
					storyId: story.id
				}
			],
			[
				'updatePassage',
				{
					passageId: story.passages[2].id,
					passageProps: {selected: false},
					storyId: story.id
				}
			]
		]);
	});

	it('throws an error if there is no story with the given ID in state', () =>
		expect(() =>
			actionCommits(
				selectPassage,
				{
					passageId: story.passages[0].id,
					storyId: story.id + 'nonexistent'
				},
				getters
			)
		).toThrow());

	it('throws an error if there is no passage with the given ID belonging to the story', () =>
		expect(() =>
			actionCommits(
				selectPassage,
				{
					passageId: story.passages[0].id + 'nonexistent',
					storyId: story.id
				},
				getters
			)
		).toThrow());
});

describe('selectPassagesInRect', () => {
	const story = fakeStoryObject(2);
	const getters = {
		storyWithId(id) {
			if (id === story.id) {
				return story;
			}
		}
	};

	beforeEach(() => {
		Object.assign(story.passages[0], {
			top: 0,
			left: 0,
			width: 100,
			height: 100,
			selected: false
		});
		Object.assign(story.passages[1], {
			top: 1000,
			left: 1000,
			width: 100,
			height: 100,
			selected: false
		});
	});

	it('selects passages intersecting the given rectangle', () => {
		expect(
			actionCommits(
				selectPassagesInRect,
				{
					height: 50,
					ignore: [],
					left: 0,
					width: 50,
					storyId: story.id,
					top: 0
				},
				getters
			)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[0].id,
					passageProps: {selected: true},
					storyId: story.id
				}
			]
		]);
	});

	it('does not do anything if the intersecting passages are already selected', () => {
		story.passages[0].selected = true;
		expect(
			actionCommits(
				selectPassagesInRect,
				{
					height: 50,
					ignore: [],
					left: 0,
					width: 50,
					storyId: story.id,
					top: 0
				},
				getters
			)
		).toEqual([]);
	});

	it('deselects passages not intersecting the given rectangle', () => {
		story.passages[0].selected = true;
		story.passages[1].selected = true;
		expect(
			actionCommits(
				selectPassagesInRect,
				{
					height: 50,
					ignore: [],
					left: 0,
					width: 50,
					storyId: story.id,
					top: 0
				},
				getters
			)
		).toEqual([
			[
				'updatePassage',
				{
					passageId: story.passages[1].id,
					passageProps: {selected: false},
					storyId: story.id
				}
			]
		]);
	});

	it('does not select passages specified by the ignore property', () =>
		expect(
			actionCommits(
				selectPassagesInRect,
				{
					height: 50,
					ignore: [{id: story.passages[0].id}],
					left: 0,
					width: 50,
					storyId: story.id,
					top: 0
				},
				getters
			)
		).toEqual([]));

	it('does not deselect passages specified by the ignore property', () => {
		story.passages[0].selected = true;
		story.passages[1].selected = true;
		expect(
			actionCommits(
				selectPassagesInRect,
				{
					height: 50,
					ignore: [{id: story.passages[1].id}],
					left: 0,
					width: 50,
					storyId: story.id,
					top: 0
				},
				getters
			)
		).toEqual([]);
	});

	it('throws an error if any rectangle prop is not numeric', () => {
		['top', 'left', 'width', 'height'].forEach(prop =>
			expect(() =>
				actionCommits(
					selectPassagesInRect,
					{
						height: 0,
						ignore: [],
						left: 0,
						width: 0,
						storyId: story.id,
						top: 0,
						[prop]: 'a'
					},
					getters
				)
			).toThrow()
		);
	});

	it('throws an error if there is no story with the given ID in state', () =>
		expect(() =>
			actionCommits(selectPassagesInRect, {
				height: 0,
				ignore: [],
				left: 0,
				width: 0,
				storyId: story.id + 'nonexistent',
				top: 0
			})
		).toThrow());
});
