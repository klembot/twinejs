import {addPassageTag, removePassageTag} from '../tag-passage';
import {Passage, Story} from '../../stories.types';
import {fakeStory} from '../../../../test-util';

describe('addPassageTag', () => {
	let passage: Passage;
	let story: Story;

	beforeEach(() => {
		story = fakeStory(1);
		passage = story.passages[0];
	});

	it('returns an updatePassage action that adds a tag to a passage', () => {
		passage.tags = ['mock-tag-1'];
		expect(addPassageTag(story, passage, 'mock-tag-2')).toEqual({
			type: 'updatePassage',
			passageId: passage.id,
			props: {tags: ['mock-tag-1', 'mock-tag-2']},
			storyId: story.id
		});
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
