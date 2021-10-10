import {deleteStory} from '../delete-story';
import {fakeStory} from '../../../../test-util';

describe('Story reducer deleteStory action handler', () => {
	it('removes a story from state', () => {
		const story = fakeStory();

		expect(deleteStory([story], story.id)).toEqual([]);
	});

	it('does not change other stories', () => {
		const story1 = fakeStory();
		const story2 = fakeStory();

		expect(deleteStory([story1, story2], story1.id)).toEqual([story2]);
		expect(deleteStory([story1, story2], story2.id)).toEqual([story1]);
	});

	it('issues a warning and makes no changes if there is no story in state with the ID requested', () => {
		const story = fakeStory();
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(deleteStory([story], story.id + 'wrong')).toEqual([story]);
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});
});
