import {repairPassage} from '../repair-passage';
import {Passage, Story} from '../../../stories.types';
import {fakeStory} from '../../../../../test-util';

describe('repairPassage', () => {
	let passage: Passage;
	let story: Story;

	beforeEach(() => {
		jest.spyOn(console, 'info').mockReturnValue();
		story = fakeStory(2);
		passage = story.passages[0];
	});

	it('returns a passage as-is if nothing is wrong with it', () =>
		expect(repairPassage(passage, story)).toBe(passage));

	it("sets a passage's ID if it is undefined", () => {
		(passage as any).id = undefined;
		expect(repairPassage(passage, story)).toEqual({
			...passage,
			id: expect.any(String)
		});
	});

	it("sets a passage's ID if it is an empty string", () => {
		const result = repairPassage({...passage, id: ''}, story);

		expect(result).toEqual({
			...passage,
			id: expect.any(String)
		});
		expect(result.id).not.toBe('');
	});

	it('sets a default on a passage property if it is undefined', () => {
		(passage as any).name = undefined;
		expect(repairPassage(passage, story)).toEqual({
			...passage,
			name: expect.any(String)
		});
	});

	it('sets a default on a passage property if it is the wrong type', () => {
		(passage as any).name = 1;
		expect(repairPassage(passage, story)).toEqual({
			...passage,
			name: expect.any(String)
		});
	});

	it('sets a default on a numeric passage property if it is not a finite number', () => {
		expect(repairPassage({...passage, left: NaN}, story)).toEqual({
			...passage,
			id: expect.any(String),
			left: 0
		});
		expect(repairPassage({...passage, top: NaN}, story)).toEqual({
			...passage,
			id: expect.any(String),
			top: 0
		});
		expect(repairPassage({...passage, left: Infinity}, story)).toEqual({
			...passage,
			id: expect.any(String),
			left: 0
		});
		expect(repairPassage({...passage, top: Infinity}, story)).toEqual({
			...passage,
			id: expect.any(String),
			top: 0
		});
	});

	it('sets passage coordinates to be 0 or more', () => {
		expect(repairPassage({...passage, left: -1}, story)).toEqual({
			...passage,
			id: expect.any(String),
			left: 0
		});
		expect(repairPassage({...passage, top: -1}, story)).toEqual({
			...passage,
			id: expect.any(String),
			top: 0
		});
	});

	it('sets passage dimensions to be 5 or more', () => {
		expect(repairPassage({...passage, height: -1}, story)).toEqual({
			...passage,
			id: expect.any(String),
			height: 5
		});
		expect(repairPassage({...passage, width: -1}, story)).toEqual({
			...passage,
			id: expect.any(String),
			width: 5
		});
	});

	it("sets the passage's story property if it isn't the parent story", () =>
		expect(repairPassage({...passage, story: 'bad'}, story)).toEqual({
			...passage,
			id: expect.any(String),
			story: story.id
		}));

	it("sets a passage's ID if it conflicts with another in the parent story", () => {
		passage.id = story.passages[1].id;

		const result = repairPassage(passage, story);

		expect(result.id).not.toBe(story.passages[1].id);
	});
});
