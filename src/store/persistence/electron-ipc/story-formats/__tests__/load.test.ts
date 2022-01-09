import {load} from '../load';
import {TwineElectronWindow} from '../../../../../electron/shared';
import {fakeUnloadedStoryFormat} from '../../../../../test-util';

describe('story formats Electron IPC load', () => {
	const electronWindow = window as TwineElectronWindow;

	afterEach(() => delete electronWindow.twineElectron);

	it('returns data stored in window.twineElectron.hydrate.storyFormats', () => {
		const storyFormats = [
			fakeUnloadedStoryFormat({selected: false}),
			fakeUnloadedStoryFormat({selected: false})
		];

		electronWindow.twineElectron = {hydrate: {storyFormats}} as any;
		expect(load()).toEqual([
			{...storyFormats[0], id: expect.any(String)},
			{...storyFormats[1], id: expect.any(String)}
		]);
	});

	it("returns an empty array if window.twineEletron.hydrate.storyFormats doesn't exist", () => {
		electronWindow.twineElectron = {} as any;
		expect(load()).toEqual([]);
		(electronWindow.twineElectron as any).hydrate = {} as any;
		expect(load()).toEqual([]);
		(electronWindow.twineElectron as any).hydrate.storyForamts = {} as any;
		expect(load()).toEqual([]);
	});

	it("returns an empty array if window.twineEletron.hydrate.storyFormats isn't an array", () => {
		electronWindow.twineElectron = {hydrate: {storyFormats: 'bad'}} as any;
		expect(load()).toEqual([]);
	});
});
