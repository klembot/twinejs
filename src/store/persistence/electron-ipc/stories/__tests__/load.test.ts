import {TwineElectronWindow} from '../../../../../electron/shared';
import {load} from '../load';
import {Story} from '../../../../stories/stories.types';
import {fakeAppInfo, fakeStory} from '../../../../../test-util';
import {publishStory} from '../../../../../util/publish';

describe('stories Electron IPC load', () => {
	const electronWindow = window as TwineElectronWindow;
	let stories: Story[];

	beforeEach(() => {
		stories = [fakeStory(), fakeStory()];
		electronWindow.twineElectron = {
			hydrate: {
				stories: stories.map(story => ({
					htmlSource: publishStory(story, fakeAppInfo()),
					mtime: new Date()
				}))
			}
		} as any;
		jest.spyOn(console, 'warn').mockReturnValue();
	});

	it('loads stories from window.twineElectron.hydrate.stories', () =>
		expect(load()).toEqual(
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

	it('links stories and passage IDs', () =>
		load().forEach(result => {
			expect(result.startPassage).toBe(result.passages[0].id);
			expect(result.passages[0].story).toBe(result.id);
		}));

	it("preserves stories' modification time", () =>
		load().forEach((result, index) =>
			expect(result.lastUpdate).toBe(
				electronWindow.twineElectron!.hydrate.stories[index].mtime
			)
		));

	it('skips stories that cannot be parsed', () => {
		electronWindow.twineElectron!.hydrate.stories[0].htmlSource = 'bad';
		expect(load()).toEqual([
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

	it("returns an empty array if window.twineElectron.hydrate.stories doesn't exist", () => {
		electronWindow.twineElectron = {} as any;
		expect(load()).toEqual([]);
		(electronWindow.twineElectron as any).hydrate = {} as any;
		expect(load()).toEqual([]);
		(electronWindow.twineElectron as any).hydrate.stories = [];
		expect(load()).toEqual([]);
	});

	it("returns an empty array if window.twineElectron.hydrate.stories isn't an array", () => {
		(electronWindow.twineElectron as any).hydrate.stories = 'bad';
		expect(load()).toEqual([]);
	});
});
