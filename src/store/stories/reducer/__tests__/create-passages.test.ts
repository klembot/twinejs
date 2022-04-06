import {fakePassage, fakeStory} from '../../../../test-util';
import {createPassages} from '../create-passages';

describe('Story reducer createPassages action handler', () => {
	it('add passages to a story', () => {
		const story = fakeStory(0);
		const passage1 = fakePassage();
		const passage2 = fakePassage();

		expect(createPassages([story], story.id, [passage1, passage2])).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [
					{...passage1, story: story.id},
					{...passage2, story: story.id}
				],
				startPassage: expect.any(String)
			}
		]);
	});

	it('links the passages to their parent story', () => {
		const story = fakeStory(0);
		const passage1 = fakePassage({story: 'wrong'});
		const passage2 = fakePassage({story: 'wrong'});

		expect(createPassages([story], story.id, [passage1, passage2])).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [
					{...passage1, story: story.id},
					{...passage2, story: story.id}
				],
				startPassage: expect.any(String)
			}
		]);
	});

	it('assigns the passages IDs if not specified', () => {
		const story = fakeStory(0);
		const passage1 = fakePassage() as any;
		const passage2 = fakePassage() as any;

		delete passage1.id;
		delete passage2.id;
		expect(
			createPassages([story], story.id, [passage1, passage2] as any)
		).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [
					{...passage1, id: expect.any(String), story: story.id},
					{...passage2, id: expect.any(String), story: story.id}
				],
				startPassage: expect.any(String)
			}
		]);
	});

	it("sets the story's start passage if this is the first passage in the story", () => {
		const story = fakeStory(0);
		const passage1 = fakePassage();
		const passage2 = fakePassage();

		expect(createPassages([story], story.id, [passage1, passage2])).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [
					{...passage1, story: story.id},
					{...passage2, story: story.id}
				],
				startPassage: passage1.id
			}
		]);
	});

	it("doesn't affect other passages in the story", () => {
		const story = fakeStory(1);
		const originalPassage = story.passages[0];
		const passage1 = fakePassage();
		const passage2 = fakePassage();

		expect(createPassages([story], story.id, [passage1, passage2])).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [
					originalPassage,
					{...passage1, story: story.id},
					{...passage2, story: story.id}
				]
			}
		]);
	});

	it("doesn't affect other stories in state", () => {
		const story1 = fakeStory(0);
		const story2 = fakeStory(0);
		const passage1 = fakePassage();
		const passage2 = fakePassage();

		expect(
			createPassages([story1, story2], story1.id, [passage1, passage2])
		).toEqual([
			{
				...story1,
				lastUpdate: expect.any(Date),
				passages: [
					{...passage1, story: story1.id},
					{...passage2, story: story1.id}
				],
				startPassage: expect.any(String)
			},
			story2
		]);
		expect(
			createPassages([story1, story2], story2.id, [passage1, passage2])
		).toEqual([
			story1,
			{
				...story2,
				lastUpdate: expect.any(Date),
				passages: [
					{...passage1, story: story2.id},
					{...passage2, story: story2.id}
				],
				startPassage: expect.any(String)
			}
		]);
	});

	it('issues a warning and skips that change if a passage with the same name already exists in the story', () => {
		const story = fakeStory(1);
		const oldPassage = story.passages[0];
		const passage = fakePassage();
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(
			createPassages([story], story.id, [
				fakePassage({name: oldPassage.name}),
				passage
			])
		).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [oldPassage, {...passage, story: story.id}],
				startPassage: expect.any(String)
			}
		]);
		expect(warnSpy).toBeCalledTimes(1);
	});

	it('issues a warning and skips that change if a passage with the same ID already exists in the story', () => {
		const story = fakeStory(1);
		const oldPassage = story.passages[0];
		const passage = fakePassage();
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(
			createPassages([story], story.id, [
				fakePassage({id: story.passages[0].id}),
				passage
			])
		).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [oldPassage, {...passage, story: story.id}],
				startPassage: expect.any(String)
			}
		]);
		expect(warnSpy).toBeCalledTimes(1);
	});

	it('issues a warning and makes no changes if there is no story with the ID specified in state', () => {
		const story = fakeStory(0);
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(
			createPassages([story], story.id + 'wrong', [fakePassage()])
		).toEqual([story]);
		expect(warnSpy).toBeCalledTimes(1);
	});

	it("changes the parent story's lastUpdate property", () => {
		const story = fakeStory();
		const oldDate = new Date('1/1/1980');

		story.lastUpdate = oldDate;

		const result = createPassages([story], story.id, [fakePassage()]);

		expect(result[0].lastUpdate.getTime()).toBeGreaterThan(oldDate.getTime());
	});
});
