import {load} from '../load';
import {TwineElectronWindow} from '../../../../../electron/shared';
import {fakeUnloadedStoryFormat} from '../../../../../test-util';

describe('story formats Electron IPC load', () => {
	const electronWindow = window as TwineElectronWindow;

	function mockIpcInvoke(data: any) {
		Object.assign(electronWindow, {
			twineElectron: {
				ipcRenderer: {
					async invoke(eventName: string) {
						if (eventName === 'load-story-formats') {
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

	it('resolves to data from invoking a load-story-formats IPC event', async () => {
		const storyFormats = [
			fakeUnloadedStoryFormat({selected: false}),
			fakeUnloadedStoryFormat({selected: false})
		];

		mockIpcInvoke(storyFormats);
		expect(await load()).toEqual([
			{...storyFormats[0], id: expect.any(String)},
			{...storyFormats[1], id: expect.any(String)}
		]);
	});

	it("resolves to an empty array if the load-story-formats IPC event doesn't return an array", async () => {
		mockIpcInvoke('bad');
		expect(await load()).toEqual([]);
		mockIpcInvoke(0);
		expect(await load()).toEqual([]);
		mockIpcInvoke(undefined);
		expect(await load()).toEqual([]);
		mockIpcInvoke(null);
		expect(await load()).toEqual([]);
		mockIpcInvoke({});
		expect(await load()).toEqual([]);
	});
});
