import {load} from '../load';
import {TwineElectronWindow} from '../../../../../electron/shared';
import {fakePrefs} from '../../../../../test-util';

describe('prefs Electron IPC load', () => {
	const electronWindow = window as TwineElectronWindow;

	function mockIpcInvoke(data: any) {
		Object.assign(electronWindow, {
			twineElectron: {
				ipcRenderer: {
					async invoke(eventName: string) {
						if (eventName === 'load-prefs') {
							return data;
						}

						throw new Error(
							`Got unexpected invoke() call for event "${eventName}"`
						);
					}
				}
			}
		});
	}

	afterEach(() => delete electronWindow.twineElectron);

	it('resolves to data from invoking a load-prefs IPC event', async () => {
		const prefs = fakePrefs();

		mockIpcInvoke(prefs);
		expect(await load()).toEqual(prefs);
	});

	it('does not return any extraneous data returned from the load-prefs IPC event', async () => {
		const prefs = {...fakePrefs(), bad: true};

		mockIpcInvoke(prefs);
		expect(await load()).toEqual({...prefs, bad: undefined});
	});

	it("resolves to an empty object if the load-prefs IPC event doesn't return an object", async () => {
		mockIpcInvoke('bad');
		expect(await load()).toEqual({});
		mockIpcInvoke(0);
		expect(await load()).toEqual({});
		mockIpcInvoke(undefined);
		expect(await load()).toEqual({});
		mockIpcInvoke(null);
		expect(await load()).toEqual({});
		mockIpcInvoke([]);
		expect(await load()).toEqual({});
	});
});
