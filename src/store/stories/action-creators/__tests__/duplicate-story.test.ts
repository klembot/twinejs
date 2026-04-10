import {duplicateStory} from '../duplicate-story';
import {Story} from '../../stories.types';
import {fakeStory} from '../../../../test-util';

describe('duplicateStory action creator', () => {
	let story: Story;

	beforeEach(() => (story = fakeStory()));

	it('returns a createStory action matching all non-unique properties of the story', () =>
		expect(duplicateStory(story, [story])).toEqual({
			type: 'createStory',
			props: expect.objectContaining({
				...story,
				id: expect.any(String),
				ifid: expect.any(String),
				name: expect.any(String),
				passages: story.passages.map(passage =>
					expect.objectContaining({
						...passage,
						// Tested below.
						id: expect.any(String),
						story: expect.any(String)
					})
				),
				// Tested below.
				startPassage: expect.any(String)
			})
		}));

	it('ensures the duplicate has a unique name', () => {
		expect(duplicateStory(story, [story]).props.name).not.toBe(story.name);

		const state = [story, fakeStory()];

		state[1].name = story.name + ' 1';

		const result = duplicateStory(story, state);

		expect(result.props.name).not.toBe(state[0].name);
		expect(result.props.name).not.toBe(state[1].name);
	});

	it('gives the duplicate story a unique ID', () =>
		expect(duplicateStory(story, [story]).props.id).not.toBe(story.id));

	it('gives the duplicate story a unique IFID', () =>
		expect(duplicateStory(story, [story]).props.ifid).not.toBe(story.ifid));

	it('links passages correctly', () => {
		expect.assertions(story.passages.length);

		const result = duplicateStory(story, [story]);

		for (const passage of result.props.passages!) {
			expect(passage.story).toBe(result.props.id);
		}
	});

	it('gives the duplicate story passages unique IDs', () => {
		expect.assertions(story.passages.length);

		const result = duplicateStory(story, [story]);

		for (let i = 0; i < story.passages.length; i++) {
			expect(result.props.passages![i].id).not.toBe(story.passages[i].id);
		}
	});

	it("sets the duplicate's start passage correctly", () => {
		story = fakeStory(3);
		story.startPassage = story.passages[2].id;

		// It's OK if 0 or 1 have the same name, but we need to be sure that the
		// third passage has a unique name.

		expect(story.passages[2].name).not.toEqual(story.passages[0].name);
		expect(story.passages[2].name).not.toEqual(story.passages[1].name);

		const startPassageName = story.passages[2].name;
		const result = duplicateStory(story, [story]);
		const duplicatedStartPassage = result.props.passages?.find(({name}) => name === startPassageName);

		expect(duplicatedStartPassage).not.toBeUndefined();
		expect(result.props.startPassage).toBe(duplicatedStartPassage!.id);
	});
});
