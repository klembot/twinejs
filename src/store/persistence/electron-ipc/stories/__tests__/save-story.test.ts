import {StoryFormatsState} from '../../../../story-formats';
import {Story} from '../../../../stories';
import {
	fakeLoadedStoryFormat,
	fakeStoryFormatProperties,
	fakeStory
} from '../../../../../test-util';
import {TwineElectronWindow} from '../../../../../electron/shared';
import {getAppInfo} from '../../../../../util/app-info';
import {
	publishStory,
	publishStoryWithFormat
} from '../../../../../util/publish';
import * as fetchStoryFormatProperties from '../../../../../util/story-format/fetch-properties';
import {saveStory} from '../save-story';

describe('saveStory()', () => {
	let formatsState: StoryFormatsState;
	let sendSpy: jest.SpyInstance;
	let story: Story;

	beforeEach(() => {
		formatsState = [fakeLoadedStoryFormat()];
		sendSpy = jest.fn();
		story = fakeStory();
		story.storyFormat = formatsState[0].name;
		story.storyFormatVersion = formatsState[0].version;
		(window as any).twineElectron = {
			ipcRenderer: {send: sendSpy}
		};
		jest.spyOn(console, 'warn').mockReturnValue();
	});

	afterEach(() => delete (window as TwineElectronWindow).twineElectron);

	it('sends a save-story-html IPC message', async () => {
		await saveStory(story, formatsState);
		expect(sendSpy.mock.calls).toEqual([
			[
				'save-story-html',
				story,
				publishStoryWithFormat(
					story,
					(formatsState[0] as any).properties.source,
					getAppInfo(),
					{startOptional: true}
				)
			]
		]);
	});

	it("loads the story's format if needed", async () => {
		const properties = fakeStoryFormatProperties();
		jest
			.spyOn(fetchStoryFormatProperties, 'fetchStoryFormatProperties')
			.mockResolvedValue(properties);

		await saveStory(story, [
			{...formatsState[0], loadState: 'unloaded', properties: undefined} as any
		]);
		expect(sendSpy.mock.calls).toEqual([
			[
				'save-story-html',
				story,
				publishStoryWithFormat(story, properties.source, getAppInfo(), {
					startOptional: true
				})
			]
		]);
	});

	it('sends story data only if the format cannot be loaded', async () => {
		jest
			.spyOn(fetchStoryFormatProperties, 'fetchStoryFormatProperties')
			.mockRejectedValue(new Error());

		await saveStory(story, [
			{...formatsState[0], loadState: 'unloaded', properties: undefined} as any
		]);
		expect(sendSpy.mock.calls).toEqual([
			[
				'save-story-html',
				story,
				publishStory(story, getAppInfo(), {
					startOptional: true
				})
			]
		]);
	});
});
