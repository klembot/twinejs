import {fakeStory} from '../../../../test-util';
import {Passage, Story} from '../../stories.types';
import {updatePassages} from '../update-passages';

describe('Story reducer updatePassages action handler', () => {
	let passage1: Passage;
	let passage2: Passage;
	let story: Story;

	beforeEach(() => {
		story = fakeStory(2);
		passage1 = story.passages[0];
		passage2 = story.passages[1];
	});

	it('changes existing passages', () => {
		expect(
			updatePassages([story], story.id, {
				[passage1.id]: {
					name: passage1.name + 'test'
				}
			})
		).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [{...passage1, name: passage1.name + 'test'}, passage2]
			}
		]);
		expect(
			updatePassages([story], story.id, {
				[passage2.id]: {
					name: passage2.name + 'test'
				}
			})
		).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [passage1, {...passage2, name: passage2.name + 'test'}]
			}
		]);
		expect(
			updatePassages([story], story.id, {
				[passage1.id]: {
					name: passage1.name + 'test'
				},
				[passage2.id]: {
					name: passage2.name + 'test'
				}
			})
		).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [
					{...passage1, name: passage1.name + 'test'},
					{...passage2, name: passage2.name + 'test'}
				]
			}
		]);
	});

	it('does not alter existing passage objects', () => {
		const oldPassageName = passage1.name;
		const result = updatePassages([story], story.id, {
			[passage1.id]: {
				name: passage1.name + 'test'
			}
		});

		expect(result[0].passages[0]).not.toBe(passage1);
		expect(passage1.name).toBe(oldPassageName);
	});

	it("changes the parent story's lastUpdate property", () => {
		const oldDate = new Date('1/1/1980');

		story.lastUpdate = oldDate;

		const result = updatePassages([story], story.id, {
			[passage1.id]: {
				name: passage1.name + 'test'
			}
		});
		expect(result[0].lastUpdate.getTime()).toBeGreaterThan(oldDate.getTime());
	});

	it('issues a warning and skips that change if another passage has the name being updated to', () => {
		const oldPassage2Left = passage2.left;
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(
			updatePassages([story], story.id, {
				[passage1.id]: {
					name: passage2.name
				},
				[passage2.id]: {
					left: passage2.left + 1
				}
			})
		).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [passage1, {...passage2, left: oldPassage2Left + 1}]
			}
		]);
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});

	it('issues a warning and skips that change if no passage in state has the ID requested', () => {
		const oldPassage2Left = passage2.left;
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(
			updatePassages([story], story.id, {
				[passage1.id + 'wrong']: {
					name: passage1.name + 'test'
				},
				[passage2.id]: {
					left: passage2.left + 1
				}
			})
		).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [passage1, {...passage2, left: oldPassage2Left + 1}]
			}
		]);
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});

	it('issues a warning and makes no changes if no story in state has the ID requested', () => {
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(
			updatePassages([story], story.id + 'wrong', {
				[passage1.id]: {
					name: passage1.name + 'test'
				}
			})
		).toEqual([story]);
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});
});
