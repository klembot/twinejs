import {cleanupPassage} from '../cleanup';

describe('Story cleanup module', () => {
	it('sets defaults on nonexistent position/size properties', () => {
		const cleaned = cleanupPassage({});

		['height', 'left', 'top', 'width'].forEach(prop => {
			expect(typeof cleaned[prop]).toBe('number');
			expect(cleaned[prop]).toBeGreaterThanOrEqual(0);
		});
	});

	it('sets defaults on non-numeric position/size properties', () => {
		const cleaned = cleanupPassage({
			height: 'a',
			left: 'a',
			top: 'a',
			width: 'a'
		});

		['height', 'left', 'top', 'width'].forEach(prop => {
			expect(typeof cleaned[prop]).toBe('number');
			expect(cleaned[prop]).toBeGreaterThanOrEqual(0);
		});
	});

	it('sets defaults on NaN position/size properties', () => {
		const cleaned = cleanupPassage({
			height: NaN,
			left: NaN,
			top: NaN,
			width: NaN
		});

		['height', 'left', 'top', 'width'].forEach(prop => {
			expect(typeof cleaned[prop]).toBe('number');
			expect(cleaned[prop]).toBeGreaterThanOrEqual(0);
		});
	});

	it('returns a copy of the original passage object', () => {
		const passage = {height: 100, left: 0, top: 0, width: 100};

		expect(cleanupPassage(passage)).not.toBe(passage);
	});
});
