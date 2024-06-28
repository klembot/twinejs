import {faker} from '@faker-js/faker';
import {Passage} from '../../store/stories';
import {fakePassage} from '../../test-util';
import {passageIsEmpty} from '../passage-is-empty';

describe('passageIsEmpty', () => {
	let passage: Passage;

	beforeEach(
		() => (passage = fakePassage({height: 100, tags: [], text: '', width: 100}))
	);

	it('returns false if the passage has any text', () => {
		expect(passageIsEmpty({...passage, text: ' '})).toBe(false);
		expect(passageIsEmpty({...passage, text: faker.lorem.words(1)})).toBe(
			false
		);
	});

	it('returns false if the passage has any tags', () => {
		expect(passageIsEmpty({...passage, tags: [faker.lorem.words(1)]})).toBe(
			false
		);
		expect(
			passageIsEmpty({
				...passage,
				tags: [faker.lorem.words(1), faker.lorem.words(1)]
			})
		).toBe(false);
	});

	it('returns false if the passage width is not 100', () => {
		expect(passageIsEmpty({...passage, width: 50})).toBe(false);
		expect(passageIsEmpty({...passage, width: 200})).toBe(false);
	});

	it('returns false if the passage height is not 100', () => {
		expect(passageIsEmpty({...passage, height: 50})).toBe(false);
		expect(passageIsEmpty({...passage, height: 200})).toBe(false);
	});

	it('returns true if the passage text is empty, has no tags, and dimensions are 100', () =>
		expect(
			passageIsEmpty({
				...passage,
				height: 100,
				name: faker.lorem.words(5),
				width: 100,
				tags: [],
				text: ''
			})
		).toBe(true));
});
