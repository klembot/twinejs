import {
	deselectAllPassages,
	deselectPassage,
	selectAllPassages,
	selectPassage,
	selectPassagesInRect
} from '../select-passage';
import {Story} from '../../stories.types';
import {fakeStory} from '../../../../test-util';
import {rectsIntersect, Rect} from '../../../../util/geometry';

jest.mock('../../../../util/geometry');

describe('deselectAllPassages', () => {
	let story: Story;
	let dispatch: jest.Mock;

	beforeEach(() => {
		dispatch = jest.fn();
		story = fakeStory(3);
	});

	it('returns a thunk that deselects all currently selected passages', () => {
		story.passages[0].selected = false;
		story.passages[1].selected = true;
		story.passages[2].selected = true;
		deselectAllPassages(story)(dispatch, () => [story]);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updatePassages',
					passageUpdates: {
						[story.passages[1].id]: {selected: false},
						[story.passages[2].id]: {selected: false}
					},
					storyId: story.id
				}
			]
		]);
	});

	it('returns a thunk that does nothing if all passages are deselected', () => {
		story.passages[0].selected = false;
		story.passages[1].selected = false;
		story.passages[2].selected = false;
		deselectAllPassages(story)(dispatch, () => [story]);
		expect(dispatch).not.toHaveBeenCalled();
	});
});

describe('deselectPassage', () => {
	let dispatch: jest.Mock;
	let story: Story;

	beforeEach(() => {
		dispatch = jest.fn();
		story = fakeStory();
	});

	it("returns a thunk that deselects a passage if it's selected", () => {
		story.passages[0].selected = true;
		deselectPassage(story, story.passages[0])(dispatch, () => [story]);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updatePassage',
					passageId: story.passages[0].id,
					props: {selected: false},
					storyId: story.id
				}
			]
		]);
	});

	it('returns a thunk that does nothing if the passage is deselected', () => {
		const dispatch = jest.fn();

		story.passages[0].selected = false;
		deselectPassage(story, story.passages[0])(dispatch, () => [story]);
		expect(dispatch).not.toHaveBeenCalled();
	});

	it('throws an error if the passage does not belong to the story', () => {
		story.passages[0].story = 'bad';

		expect(() => deselectPassage(story, story.passages[0])).toThrow();
	});
});

describe('selectAllPassages', () => {
	let dispatch: jest.Mock;
	let story: Story;

	beforeEach(() => {
		dispatch = jest.fn();
		story = fakeStory(3);
	});

	it('returns a thunk that selects all currently deselected passages', () => {
		story.passages[0].selected = false;
		story.passages[1].selected = true;
		story.passages[2].selected = false;
		selectAllPassages(story)(dispatch, () => [story]);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updatePassages',
					passageUpdates: {
						[story.passages[0].id]: {selected: true},
						[story.passages[2].id]: {selected: true}
					},
					storyId: story.id
				}
			]
		]);
	});

	it('returns a thunk that does nothing if all passages are selected', () => {
		story.passages[0].selected = true;
		story.passages[1].selected = true;
		story.passages[2].selected = true;
		selectAllPassages(story)(dispatch, () => [story]);
		expect(dispatch).not.toHaveBeenCalled();
	});
});

describe('selectPassage', () => {
	let dispatch: jest.Mock;
	let story: Story;

	beforeEach(() => {
		dispatch = jest.fn();
		story = fakeStory(3);
	});

	describe('when the passage is deselected', () => {
		beforeEach(() => {
			story.passages[0].selected = false;
			story.passages[1].selected = true;
			story.passages[2].selected = false;
		});

		it('returns a thunk that selects the passage if the exclusive argument is false', () => {
			selectPassage(story, story.passages[0], false)(dispatch, () => [story]);
			expect(dispatch.mock.calls).toEqual([
				[
					{
						type: 'updatePassages',
						passageUpdates: {
							[story.passages[0].id]: {selected: true}
						},
						storyId: story.id
					}
				]
			]);
		});

		it('returns a thunk that selects the passage and deselects all others if the exclusive argument is true', () => {
			story.passages[0].selected = false;
			selectPassage(story, story.passages[0], true)(dispatch, () => [story]);
			expect(dispatch.mock.calls).toEqual([
				[
					{
						type: 'updatePassages',
						passageUpdates: {
							[story.passages[0].id]: {selected: true},
							[story.passages[1].id]: {selected: false}
						},
						storyId: story.id
					}
				]
			]);
		});
	});

	describe('when the passage is already selected', () => {
		beforeEach(() => {
			story.passages[0].selected = true;
			story.passages[1].selected = true;
			story.passages[2].selected = false;
		});

		it('returns a thunk that does nothing if the exclusive argument is false', () => {
			selectPassage(story, story.passages[0], false)(dispatch, () => [story]);
			expect(dispatch).not.toHaveBeenCalled();
		});

		it('returns a thunk that deselects all others if the exclusive argument is true', () => {
			selectPassage(story, story.passages[0], true)(dispatch, () => [story]);
			expect(dispatch.mock.calls).toEqual([
				[
					{
						type: 'updatePassages',
						passageUpdates: {
							[story.passages[1].id]: {selected: false}
						},
						storyId: story.id
					}
				]
			]);
		});
	});

	describe("when the passage doesn't belong to the story", () => {
		it('throws an error', () => {
			story.passages[0].story = 'bad';

			expect(() => selectPassage(story, story.passages[0], false)).toThrow();
			expect(() => selectPassage(story, story.passages[0], true)).toThrow();
		});
	});
});

describe('selectPassagesInRect', () => {
	let dispatch: jest.Mock;
	let story: Story;
	let rectIntersectsMock: jest.Mock;

	beforeEach(() => {
		dispatch = jest.fn();
		story = fakeStory(3);
		story.passages[0].selected = false;
		story.passages[1].selected = true;
		story.passages[2].selected = false;
		rectIntersectsMock = rectsIntersect as jest.Mock;

		// This takes a shortcut because we know that r2 will always be the passage,
		// not the rectangle being compared.

		rectIntersectsMock.mockImplementation((r1: Rect, r2: Rect) => {
			return (
				r2.left === story.passages[0].left &&
				r2.top === story.passages[0].top &&
				r2.height === story.passages[0].height &&
				r2.width === story.passages[0].width
			);
		});
	});

	it('selects passages inside a rectangle', () => {
		selectPassagesInRect(
			story,
			{left: 0, top: 0, width: 0, height: 0},
			[]
		)(dispatch, () => [story]);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updatePassages',
					passageUpdates: {
						[story.passages[0].id]: {selected: true},
						[story.passages[1].id]: {selected: false}
					},
					storyId: story.id
				}
			]
		]);
	});

	it('takes no action on passages whose ID is in the ignoreIds argument', () => {
		selectPassagesInRect(story, {left: 0, top: 0, width: 0, height: 0}, [
			story.passages[0].id
		])(dispatch, () => [story]);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updatePassages',
					passageUpdates: {
						[story.passages[1].id]: {selected: false}
					},
					storyId: story.id
				}
			]
		]);

		dispatch.mockReset();
		selectPassagesInRect(story, {left: 0, top: 0, width: 0, height: 0}, [
			story.passages[1].id
		])(dispatch, () => [story]);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updatePassages',
					passageUpdates: {
						[story.passages[0].id]: {selected: true}
					},
					storyId: story.id
				}
			]
		]);

		dispatch.mockReset();
		selectPassagesInRect(story, {left: 0, top: 0, width: 0, height: 0}, [
			story.passages[0].id,
			story.passages[1].id
		])(dispatch, () => [story]);
		expect(dispatch).not.toHaveBeenCalled();
	});
});
