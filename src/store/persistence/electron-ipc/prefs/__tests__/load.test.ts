import {load} from '../load';
import {TwineElectronWindow} from '../../../../../electron/shared';
import {fakePrefs} from '../../../../../test-util';

describe('prefs Electron IPC load', () => {
	const electronWindow = window as TwineElectronWindow;

	afterEach(() => delete electronWindow.twineElectron);

	it('returns data stored in window.twineElectron.hydrate.prefs', () => {
		const prefs = fakePrefs();

		electronWindow.twineElectron = {hydrate: {prefs}} as any;
		expect(load()).toEqual(prefs);
	});

	it('does not return any extraneous data in window.twineElectron.hydrate.prefs', () => {
		const prefs = {...fakePrefs(), bad: true};

		electronWindow.twineElectron = {hydrate: {prefs}} as any;
		expect(load()).toEqual({...prefs, bad: undefined});
	});

	it("returns an empty object if window.twineEletron.hydrate.prefs doesn't exist", () => {
		electronWindow.twineElectron = {} as any;
		expect(load()).toEqual({});
		(electronWindow.twineElectron as any).hydrate = {} as any;
		expect(load()).toEqual({});
		(electronWindow.twineElectron as any).hydrate.prefs = {} as any;
		expect(load()).toEqual({});
	});

	it("returns an empty object if window.twineElectron.hydrate.prefs isn't an object", () => {
		electronWindow.twineElectron = {hydrate: {prefs: 'bad'}} as any;
		expect(load()).toEqual({});
	});
});
