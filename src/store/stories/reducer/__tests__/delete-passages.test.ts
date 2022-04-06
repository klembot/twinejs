import {fakeStory} from '../../../../test-util';
import {Passage, Story} from '../../stories.types';
import {deletePassages} from '../delete-passages';

describe('Story reducer deletePassages action handler', () => {
	let passage1: Passage;
	let passage2: Passage;
	let story: Story;

	beforeEach(() => {
		story = fakeStory(2);
		passage1 = story.passages[0];
		passage2 = story.passages[1];
	});

	it('removes passages from state', () =>
		expect(
			deletePassages([story], story.id, [passage1.id, passage2.id])
		).toEqual([{...story, lastUpdate: expect.any(Date), passages: []}]));

	it('does not change other passages in the same story', () => {
		expect(deletePassages([story], story.id, [passage1.id])).toEqual([
			{...story, lastUpdate: expect.any(Date), passages: [passage2]}
		]);
		expect(deletePassages([story], story.id, [passage2.id])).toEqual([
			{...story, lastUpdate: expect.any(Date), passages: [passage1]}
		]);
	});

	it('does not change passages in other stories', () => {
		const story2 = fakeStory();

		expect(deletePassages([story, story2], story.id, [passage1.id])).toEqual([
			{...story, lastUpdate: expect.any(Date), passages: [passage2]},
			story2
		]);
	});

	it("changes the parent story's lastUpdate property", () => {
		const oldDate = new Date('1/1/1980');

		story.lastUpdate = oldDate;

		const result = deletePassages([story], story.id, [passage1.id]);

		expect(result[0].lastUpdate.getTime()).toBeGreaterThan(oldDate.getTime());
	});

	it('issues a warning and makes no changes if there is no story in state with the ID requested', () => {
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(deletePassages([story], story.id + 'wrong', [passage1.id])).toEqual([
			story
		]);
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});

	it('issues a warning and skips that change if there is no passage in state with the ID requested', () => {
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(
			deletePassages([story], story.id, [passage1.id + 'wrong', passage2.id])
		).toEqual([{...story, lastUpdate: expect.any(Date), passages: [passage1]}]);
		expect(warnSpy).toHaveBeenCalledTimes(1);
		warnSpy.mockReset();
		expect(
			deletePassages([story], story.id, [passage1.id, passage2.id + 'wrong'])
		).toEqual([{...story, lastUpdate: expect.any(Date), passages: [passage2]}]);
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});
});
