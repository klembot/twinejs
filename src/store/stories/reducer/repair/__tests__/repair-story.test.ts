import {repairStory} from '../repair-story';
import * as repairPassage from '../repair-passage';
import {Story} from '../../../stories.types';
import {StoryFormat} from '../../../../story-formats';
import {fakeStory, fakeUnloadedStoryFormat} from '../../../../../test-util';

describe('repairStory', () => {
	let allFormats: StoryFormat[];
	let defaultFormat: StoryFormat;
	let story: Story;

	beforeEach(() => {
		jest.spyOn(console, 'info').mockReturnValue();
		defaultFormat = fakeUnloadedStoryFormat({
			name: 'default-format',
			version: '1.0.0'
		});
		allFormats = [defaultFormat, fakeUnloadedStoryFormat()];
		story = fakeStory(2);
		story.storyFormat = allFormats[1].name;
		story.storyFormatVersion = allFormats[1].version;
	});

	it('returns the story as-is if there is nothing wrong with it', () => {
		expect(repairStory(story, [story], allFormats, defaultFormat)).toBe(story);
	});

	it("sets the story's ID if it is undefined", () => {
		(story as any).id = undefined;

		const result = repairStory(story, [story], allFormats, defaultFormat);

		expect(result).toEqual({
			...story,
			id: expect.any(String),
			passages: story.passages.map(passage => ({
				...passage,
				story: expect.any(String)
			}))
		});
		expect(result.passages[0].story).toBe(result.id);
		expect(result.passages[1].story).toBe(result.id);
	});

	it("changes the story's ID if it conflicts with another story's", () => {
		const otherStory = fakeStory();

		story.id = otherStory.id;

		const result = repairStory(
			story,
			[story, otherStory],
			allFormats,
			defaultFormat
		);

		expect(result.id).not.toBe(otherStory.id);
	});

	it("sets the story's IFID if it is undefined", () => {
		(story as any).ifid = undefined;
		expect(repairStory(story, [story], allFormats, defaultFormat)).toEqual({
			...story,
			ifid: expect.any(String)
		});
	});

	it('sets a default on a story property if it is undefined', () => {
		(story as any).name = undefined;
		expect(repairStory(story, [story], allFormats, defaultFormat)).toEqual({
			...story,
			name: expect.any(String)
		});
	});

	it('sets a default on a story property if it is the wrong type', () => {
		(story as any).name = 1;
		expect(repairStory(story, [story], allFormats, defaultFormat)).toEqual({
			...story,
			name: expect.any(String)
		});
	});

	it('sets a default on a numeric story property if it is not a finite number', () => {
		(story as any).zoom = NaN;
		expect(repairStory(story, [story], allFormats, defaultFormat)).toEqual({
			...story,
			zoom: 1
		});
		(story as any).zoom = Infinity;
		expect(repairStory(story, [story], allFormats, defaultFormat)).toEqual({
			...story,
			zoom: 1
		});
	});

	it('assigns the default story format to a story if it is unset', () => {
		(story as any).storyFormat = undefined;

		expect(repairStory(story, [story], allFormats, defaultFormat)).toEqual({
			...story,
			storyFormat: defaultFormat.name,
			storyFormatVersion: defaultFormat.version
		});
	});

	describe("when the story's story format does not exist", () => {
		it('assigns it one that matches semver', () => {
			allFormats[1].version = '1.2.0';
			story.storyFormatVersion = '1.1.0';

			expect(repairStory(story, [story], allFormats, defaultFormat)).toEqual({
				...story,
				storyFormatVersion: allFormats[1].version
			});
		});

		it('assigns the default format if none match semver', () => {
			allFormats[1].version = '2.0.0';
			story.storyFormatVersion = '1.1.0';

			expect(repairStory(story, [story], allFormats, defaultFormat)).toEqual({
				...story,
				storyFormat: defaultFormat.name,
				storyFormatVersion: defaultFormat.version
			});
		});
	});

	it('repairs all passages', () => {
		const repairSpy = jest.spyOn(repairPassage, 'repairPassage');

		repairStory(story, [story], allFormats, defaultFormat);
		expect(repairSpy.mock.calls).toEqual([
			[story.passages[0], story],
			[story.passages[1], story]
		]);
	});
});
