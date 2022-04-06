import {createStory} from '../create-story';
import {fakeStory} from '../../../../test-util';

describe('Story reducer createStory action handler', () => {
	it('adds a story to state', () => {
		const story = fakeStory();

		expect(createStory([], story)).toEqual([story]);
	});

	it('does not overwrite existing stories', () => {
		const story1 = fakeStory();
		const story2 = fakeStory();

		expect(createStory([story1], story2)).toEqual([story1, story2]);
	});

	it('issues a warning and makes no changes if a story with the same ID already exists in state', () => {
		const story1 = fakeStory();
		const story2 = fakeStory();
		const state = [story1, story2];

		story2.id = story1.id;

		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(createStory(state, story2)).toBe(state);
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});

	it('issues a warning and makes no changes if a story with the same name already exists in state', () => {
		const story1 = fakeStory();
		const story2 = fakeStory();
		const state = [story1];

		story2.name = story1.name;

		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(createStory(state, story2)).toEqual(state);
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});

	it('assigns the story an ID and IFID if not specified', () => {
		const story = fakeStory(0) as any;

		delete story.id;
		delete story.ifid;

		expect(createStory([], story)).toEqual([
			{...story, ifid: expect.any(String), id: expect.any(String)}
		]);
	});

	it("sets the story's lastUpdate if not specified", () => {
		const story = fakeStory(0) as any;

		delete story.lastUpdate;

		expect(createStory([], story)).toEqual([
			{...story, lastUpdate: expect.any(Date)}
		]);
	});

	it('ensures all passages have the correct story property', () => {
		const story = fakeStory(5);

		story.passages = story.passages.map(passage => ({
			...passage,
			story: 'wrong'
		}));

		const result = createStory([], story);

		result[0].passages.forEach(passage =>
			expect(passage.story).toBe(result[0].id)
		);
	});
});
