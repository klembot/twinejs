import {isTagColor, tagColors} from '../tag-color';

describe('isTagColor', () => {
	it('returns true for valid tag colors', () =>
		tagColors.forEach(color => expect(isTagColor(color)).toBe(true)));

	it('returns false for an invalid tag color', () =>
		expect(isTagColor('this is not a color')).toBe(false));
});
