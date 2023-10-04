import {load} from '../load';
import {TwineElectronWindow} from '../../../../../electron/shared';
import {fakePrefs} from '../../../../../test-util';

describe('prefs Electron IPC load', () => {
	const electronWindow = window as TwineElectronWindow;

	function mockLoadPrefs(data: any) {
		Object.assign(electronWindow, {
			twineElectron: {
				loadPrefs: async function () {
					return data;
				}
			}
		});
	}

	afterEach(() => delete electronWindow.twineElectron);

	it('resolves to data from calling loadPrefs on the twineElectron global', async () => {
		const prefs = fakePrefs();

		mockLoadPrefs(prefs);
		expect(await load()).toEqual(prefs);
	});

	it('does not return any extraneous data returned from loadPrefs', async () => {
		const prefs = {...fakePrefs(), bad: true};

		mockLoadPrefs(prefs);
		expect(await load()).toEqual({...prefs, bad: undefined});
	});

	it("resolves to an empty object if loadPrefs doesn't return an object", async () => {
		mockLoadPrefs('bad');
		expect(await load()).toEqual({});
		mockLoadPrefs(0);
		expect(await load()).toEqual({});
		mockLoadPrefs(undefined);
		expect(await load()).toEqual({});
		mockLoadPrefs(null);
		expect(await load()).toEqual({});
		mockLoadPrefs([]);
		expect(await load()).toEqual({});
	});
});
