import {
	isPersistablePassageChange,
	isPersistableStoryChange
} from '../persistable-changes';

describe('isPersistablePassageChange()', () => {
	it('returns false for highlighted', () =>
		expect(isPersistablePassageChange({selected: true})).toBe(false));

	it('returns false for selected', () =>
		expect(isPersistablePassageChange({selected: true})).toBe(false));

	it.each([
		'height',
		'id',
		'left',
		'name',
		'story',
		'tags',
		'text',
		'top',
		'width'
	])('returns true for %s', key =>
		expect(
			isPersistablePassageChange({
				[key]: true,
				highlighted: true,
				selected: true
			})
		).toBe(true)
	);
});

describe('isPersistableStoryChange()', () => {
	it('returns false for selected', () =>
		expect(isPersistableStoryChange({selected: true})).toBe(false));

	it('returns false for lastUpdate', () =>
		expect(isPersistableStoryChange({lastUpdate: new Date()})).toBe(false));

	it.each([
		'ifid',
		'id',
		'name',
		'passages',
		'script',
		'snapToGrid',
		'startPassage',
		'storyFormat',
		'storyFormatVersion',
		'stylesheet',
		'tags',
		'tagColors',
		'zoom'
	])('returns true for %s', key =>
		expect(isPersistableStoryChange({[key]: true, selected: true})).toBe(true)
	);
});
