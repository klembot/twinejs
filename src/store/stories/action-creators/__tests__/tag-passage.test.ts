import {addPassageTag, removePassageTag} from '../tag-passage';
import {Passage, Story} from '../../stories.types';
import {fakeStory} from '../../../../test-util';
import {colorString} from '../../../../util/color';

describe('addPassageTag', () => {
	let passage: Passage;
	let story: Story;

	beforeEach(() => {
		story = fakeStory(1);
		passage = story.passages[0];
	});

	it("returns a thunk that adds a tag to a passage and sets a color if the tag hasn't been used before", () => {
		const dispatch = jest.fn();

		passage.tags = ['mock-tag-1'];
		addPassageTag(story, passage, 'mock-tag-2')(dispatch, jest.fn());
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updateStory',
					props: {
						tagColors: {
							...story.tagColors,
							'mock-tag-2': colorString('mock-tag-2')
						}
					},
					storyId: story.id
				}
			],
			[
				{
					type: 'updatePassage',
					passageId: passage.id,
					props: {tags: ['mock-tag-1', 'mock-tag-2']},
					storyId: story.id
				}
			]
		]);
	});

	it('returns a thunk that only adds a tag to a passage if the tag has been used before', () => {
		const dispatch = jest.fn();

		story = fakeStory(2);
		story.passages[0].tags = ['mock-tag-1'];
		story.passages[1].tags = ['mock-tag-2'];
		addPassageTag(story, story.passages[0], 'mock-tag-2')(dispatch, jest.fn());
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updatePassage',
					passageId: story.passages[0].id,
					props: {tags: ['mock-tag-1', 'mock-tag-2']},
					storyId: story.id
				}
			]
		]);
	});

	it('throws an error if the tag name is invalid', () =>
		expect(() => addPassageTag(story, passage, 'bad tag')).toThrow());

	it('throws an error if the passage already has this tag', () => {
		passage.tags = ['mock-tag-name'];
		expect(() => addPassageTag(story, passage, 'mock-tag-name')).toThrow();
	});

	it('throws an error if the passage does not belong to the story', () => {
		passage.story = 'not this story';
		expect(() => addPassageTag(story, passage, 'mock-tag-name')).toThrow();
	});
});

describe('removePassageTag', () => {
	let passage: Passage;
	let story: Story;

	beforeEach(() => {
		story = fakeStory(1);
		passage = story.passages[0];
	});

	it('returns an updatePassage action that removes a tag to a passage', () => {
		passage.tags = ['mock-tag-1', 'mock-tag-2'];
		expect(removePassageTag(story, passage, 'mock-tag-1')).toEqual({
			type: 'updatePassage',
			passageId: passage.id,
			props: {tags: ['mock-tag-2']},
			storyId: story.id
		});
	});

	it('throws an error if the tag name is invalid', () =>
		expect(() => removePassageTag(story, passage, 'bad tag')).toThrow());

	it("throws an error if the passage doesn't already has this tag", () => {
		passage.tags = ['mock-tag-1'];
		expect(() => removePassageTag(story, passage, 'mock-tag-2')).toThrow();
	});

	it('throws an error if the passage does not belong to the story', () => {
		passage.story = 'not this story';
		expect(() => removePassageTag(story, passage, 'mock-tag-name')).toThrow();
	});
});
