import {fakeStory} from '../../../../test-util';
import {Passage, Story} from '../../stories.types';
import {deletePassage} from '../delete-passage';

describe('Story reducer deletePassage action handler', () => {
	let passage: Passage;
	let story: Story;

	beforeEach(() => {
		story = fakeStory();
		passage = story.passages[0];
	});

	it('removes a passage from state', () =>
		expect(deletePassage([story], story.id, passage.id)).toEqual([
			{...story, lastUpdate: expect.any(Date), passages: []}
		]));

	it('does not change other passages in the same story', () => {
		story = fakeStory(2);

		const oldPassages = [...story.passages];

		expect(deletePassage([story], story.id, oldPassages[0].id)).toEqual([
			{...story, lastUpdate: expect.any(Date), passages: [oldPassages[1]]}
		]);
		expect(deletePassage([story], story.id, oldPassages[1].id)).toEqual([
			{...story, lastUpdate: expect.any(Date), passages: [oldPassages[0]]}
		]);
	});

	it('does not change passages in other stories', () => {
		const story2 = fakeStory();

		expect(deletePassage([story, story2], story.id, passage.id)).toEqual([
			{...story, lastUpdate: expect.any(Date), passages: []},
			story2
		]);
	});

	it("changes the parent story's lastUpdate property", () => {
		const oldDate = new Date('1/1/1980');
		story.lastUpdate = oldDate;

		const result = deletePassage([story], story.id, passage.id);
		expect(result[0].lastUpdate.getTime()).toBeGreaterThan(oldDate.getTime());
	});

	it('issues a warning and makes no changes if there is no story in state with the ID requested', () => {
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});
		expect(deletePassage([story], story.id + 'wrong', passage.id)).toEqual([
			story
		]);
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});

	it('issues a warning and makes no changes if there is no passage in state with the ID requested', () => {
		const story = fakeStory();
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});
		expect(deletePassage([story], story.id, passage.id + 'wrong')).toEqual([
			story
		]);
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});
});
