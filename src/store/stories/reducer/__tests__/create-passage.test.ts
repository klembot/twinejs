import {fakePassage, fakeStory} from '../../../../test-util';
import {createPassage} from '../create-passage';

describe('Story reducer createPassage action handler', () => {
	it('adds a passage to a story', () => {
		const story = fakeStory(0);
		const passage = fakePassage();

		expect(createPassage([story], story.id, passage)).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [{...passage, story: story.id}],
				startPassage: expect.any(String)
			}
		]);
	});

	it('links the passage to its parent story', () => {
		const story = fakeStory(0);
		const passage = fakePassage({story: 'wrong'});

		expect(createPassage([story], story.id, passage)).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [{...passage, story: story.id}],
				startPassage: expect.any(String)
			}
		]);
	});

	it('assigns the passage an ID if not specified', () => {
		const story = fakeStory(0);
		const passage = fakePassage() as any;

		delete passage.id;
		expect(createPassage([story], story.id, passage)).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [{...passage, id: expect.any(String), story: story.id}],
				startPassage: expect.any(String)
			}
		]);
	});

	it("sets the story's start passage if this is the first passage in the story", () => {
		const story = fakeStory(0);
		const passage = fakePassage();

		expect(createPassage([story], story.id, passage)).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [{...passage, id: expect.any(String), story: story.id}],
				startPassage: passage.id
			}
		]);
	});

	it("doesn't affect other passages in the story", () => {
		const story = fakeStory(1);
		const originalPassage = story.passages[0];
		const passage = fakePassage();

		expect(createPassage([story], story.id, passage)).toEqual([
			{
				...story,
				lastUpdate: expect.any(Date),
				passages: [
					originalPassage,
					{...passage, id: expect.any(String), story: story.id}
				]
			}
		]);
	});

	it("doesn't affect other stories in state", () => {
		const story1 = fakeStory(0);
		const story2 = fakeStory(0);
		const passage = fakePassage();

		expect(createPassage([story1, story2], story1.id, passage)).toEqual([
			{
				...story1,
				lastUpdate: expect.any(Date),
				passages: [{...passage, story: story1.id}],
				startPassage: expect.any(String)
			},
			story2
		]);
		expect(createPassage([story1, story2], story2.id, passage)).toEqual([
			story1,
			{
				...story2,
				lastUpdate: expect.any(Date),
				passages: [{...passage, story: story2.id}],
				startPassage: expect.any(String)
			}
		]);
	});

	it('issues a warning and makes no changes if a passage with the same name already exists in the story', () => {
		const story = fakeStory(1);
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(
			createPassage(
				[story],
				story.id,
				fakePassage({name: story.passages[0].name})
			)
		).toEqual([story]);
		expect(warnSpy).toBeCalledTimes(1);
	});

	it('issues a warning and makes no changes if a passage with the same ID already exists in the story', () => {
		const story = fakeStory(1);
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(
			createPassage([story], story.id, fakePassage({id: story.passages[0].id}))
		).toEqual([story]);
		expect(warnSpy).toBeCalledTimes(1);
	});

	it('issues a warning and makes no changes if there is no story with the ID specified in state', () => {
		const story = fakeStory(0);
		const warnSpy = jest
			.spyOn(global.console, 'warn')
			.mockImplementation(() => {});

		expect(createPassage([story], story.id + 'wrong', fakePassage())).toEqual([
			story
		]);
		expect(warnSpy).toBeCalledTimes(1);
	});

	it("changes the parent story's lastUpdate property", () => {
		const story = fakeStory();
		const oldDate = new Date('1/1/1980');

		story.lastUpdate = oldDate;

		const result = createPassage([story], story.id, fakePassage());

		expect(result[0].lastUpdate.getTime()).toBeGreaterThan(oldDate.getTime());
	});
});
