import {TwineElectronWindow} from '../../../../../electron/shared';
import {load} from '../load';
import {Story} from '../../../../stories/stories.types';
import {fakeAppInfo, fakeStory} from '../../../../../test-util';
import {publishStory} from '../../../../../util/publish';

describe('stories Electron IPC load', () => {
	const electronWindow = window as TwineElectronWindow;
	let stories: Story[];
	let storydata: any[];

	function mockIpcInvoke(data: any) {
		Object.assign(electronWindow, {
			twineElectron: {
				ipcRenderer: {
					async invoke(eventName: string) {
						if (eventName === 'load-stories') {
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

	beforeEach(() => {
		stories = [fakeStory(), fakeStory()];
		storydata = stories.map(story => ({
			htmlSource: publishStory(story, fakeAppInfo()),
			mtime: new Date()
		}));

		mockIpcInvoke(storydata);
		jest.spyOn(console, 'warn').mockReturnValue();
	});

	it('loads stories from invoking a load-stories IPC event', async () =>
		expect(await load()).toEqual(
			stories.map(story => ({
				...story,
				id: expect.any(String),
				lastUpdate: expect.any(Date),
				passages: [
					{
						...story.passages[0],
						id: expect.any(String),
						// This is not preserved in publishing right now.
						selected: false,
						story: expect.any(String)
					}
				],
				selected: false,
				// This is not preserved in publishing right now.
				snapToGrid: expect.any(Boolean),
				startPassage: expect.any(String)
			}))
		));

	it('links stories and passage IDs', async () => {
		for (const result of await load()) {
			expect(result.startPassage).toBe(result.passages[0].id);
			expect(result.passages[0].story).toBe(result.id);
		}
	});

	it("preserves stories' modification time", async () => {
		(await load()).forEach((result, index) =>
			expect(result.lastUpdate).toBe(storydata[index].mtime)
		);
	});

	it('skips stories that cannot be parsed', async () => {
		storydata[0].htmlSource = 'bad';
		expect(await load()).toEqual([
			{
				...stories[1],
				id: expect.any(String),
				lastUpdate: expect.any(Date),
				passages: [
					{
						...stories[1].passages[0],
						id: expect.any(String),
						// This is not preserved in publishing right now.
						selected: false,
						story: expect.any(String)
					}
				],
				selected: false,
				// This is not preserved in publishing right now.
				snapToGrid: expect.any(Boolean),
				startPassage: expect.any(String)
			}
		]);
	});

	it("resolves to an empty array if the load-prefs IPC event doesn't return an array", async () => {
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
