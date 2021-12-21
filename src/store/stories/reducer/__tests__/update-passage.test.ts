import {fakePassage, fakeStory} from '../../../../test-util';
import {Passage, Story} from '../../stories.types';
import {updatePassage} from '../update-passage';

describe('Story reducer updatePassage action handler', () => {
	let passage: Passage;
	let story: Story;

	beforeEach(() => {
		story = fakeStory();
		passage = story.passages[0];
	});

	it('changes an existing passage', () =>
		expect(
			updatePassage([story], story.id, passage.id, {
				name: passage.name + 'test'
			})
		).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [{...passage, name: passage.name + 'test'}]
			}
		]));

	it('does not alter the existing passage object', () => {
		const oldPassageName = passage.name;
		const result = updatePassage([story], story.id, passage.id, {
			name: passage.name + 'test'
		});

		expect(result[0].passages[0]).not.toBe(passage);
		expect(passage.name).toBe(oldPassageName);
	});

	it("changes the parent story's lastUpdate property if the change is persistable", () => {
		const oldDate = new Date('1/1/1980');

		story.lastUpdate = oldDate;

		const result = updatePassage([story], story.id, passage.id, {
			name: passage.name + 'test'
		});
		expect(result[0].lastUpdate.getTime()).toBeGreaterThan(oldDate.getTime());
	});

	it("doesn't change the parent story's lastUpdate property if the change isn't persistable", () => {
		const oldDate = new Date('1/1/1980');

		story.lastUpdate = oldDate;

		const result = updatePassage([story], story.id, passage.id, {
			selected: true
		});
		expect(result[0].lastUpdate).toBe(oldDate);
	});


	it('issues a warning and makes no changes if another passage has the name being updated to', () => {
		story.passages.push(fakePassage());

		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(
			updatePassage([story], story.id, passage.id, {
				name: story.passages[1].name
			})
		).toEqual([story]);
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});

	it('issues a warning and makes no changes if no passage in state has the ID requested', () => {
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(
			updatePassage([story], story.id, passage.id + 'wrong', {
				name: passage.name + 'test'
			})
		).toEqual([story]);
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});

	it('issues a warning and makes no changes if no story in state has the ID requested', () => {
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(
			updatePassage([story], story.id + 'wrong', passage.id, {
				name: passage.name + 'test'
			})
		).toEqual([story]);
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});
});
