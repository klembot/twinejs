import {save} from '../save';
import {fakePrefs} from '../../../../../test-util';

describe('prefs local storage save', () => {
	beforeEach(() => window.localStorage.clear());
	afterAll(() => window.localStorage.clear());

	it('saves preferences to local storage', () => {
		const prefs = fakePrefs();

		save(prefs);

		const ids = window.localStorage.getItem('twine-prefs')!.split(',');

		expect(ids.length).toBe(Object.keys(prefs).length);

		let saved: any = {};

		ids.forEach(id => {
			let savedPref = window.localStorage.getItem(`twine-prefs-${id}`);

			expect(typeof savedPref).toBe('string');
			const restored = JSON.parse(savedPref as string);

			saved[restored.name] = restored.value;
		});

		for (const key in prefs) {
			expect(saved[key]).toEqual((prefs as any)[key]);
		}
	});
});
