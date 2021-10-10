import {updateStory} from '../update-story';
import {fakeStory} from '../../../../test-util';

describe('Story reducer updateStory action handler', () => {
	it('changes an existing story', () => {
		const story = fakeStory();

		expect(
			updateStory([story], story.id, {name: story.name + 'test'})
		).toEqual([
			{...story, lastUpdate: expect.any(Date), name: story.name + 'test'}
		]);
	});

	it('does not alter the old story object', () => {
		const story = fakeStory();
		const oldName = story.name;
		const result = updateStory([story], story.id, {name: oldName + 'test'});

		expect(result[0]).not.toBe(story);
		expect(story.name).toBe(oldName);
	});

	it("changes the story's lastUpdate property", () => {
		const story = fakeStory();
		const oldDate = new Date('1/1/1980');

		story.lastUpdate = oldDate;

		const result = updateStory([story], story.id, {name: story.name + 'test'});

		expect(result[0].lastUpdate.getTime()).toBeGreaterThan(oldDate.getTime());
	});

	it('issues a warning and makes no changes if another story has the name being updated to', () => {
		const story1 = fakeStory();
		const story2 = fakeStory();
		const state = [story1, story2];
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(updateStory(state, story1.id, {name: story2.name})).toBe(state);
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});

	it('issues a warning and makes no changes if no story in state has the ID requested', () => {
		const story1 = fakeStory();
		const story2 = fakeStory();
		const state = [story1, story2];
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(
			updateStory(state, story1.id + 'wrong', {name: story1.name + 'test'})
		).toBe(state);
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});
});
