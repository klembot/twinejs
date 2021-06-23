import {saveMiddleware} from '../save-middleware';
import {StoryFormatsState} from '../../../../story-formats';
import {StoriesState} from '../../../../stories';
import {
	fakeLoadedStoryFormat,
	fakePassage,
	fakeStory
} from '../../../../../test-util/fakes';
import {TwineElectronWindow} from '../../../../../electron/electron.types';
import {getAppInfo} from '../../../../../util/app-info';

// FIXME add error handler in context

describe('stories Electron IPC save middleware', () => {
	let formatsState: StoryFormatsState;
	let storiesState: StoriesState;
	let onceSpy: jest.SpyInstance;
	let sendSpy: jest.SpyInstance;
	let warnSpy: jest.SpyInstance;

	beforeEach(() => {
		formatsState = [fakeLoadedStoryFormat()];
		onceSpy = jest.fn();
		sendSpy = jest.fn();
		storiesState = [fakeStory()];
		storiesState[0].storyFormat = formatsState[0].name;
		storiesState[0].storyFormatVersion = formatsState[0].version;

		(window as any).twineElectron = {
			ipcRenderer: {once: onceSpy, send: sendSpy}
		};
		warnSpy = jest.spyOn(console, 'warn').mockReturnValue();
	});

	afterEach(() => delete (window as TwineElectronWindow).twineElectron);

	it('takes no action when an init action is received', () => {
		saveMiddleware(storiesState, {type: 'init', state: []}, formatsState);
		expect(sendSpy).not.toHaveBeenCalled();
	});

	it('takes no action when a repair action is received', () => {
		saveMiddleware(
			storiesState,
			{
				type: 'repair',
				allFormats: formatsState,
				defaultFormat: formatsState[0]
			},
			formatsState
		);
		expect(sendSpy).not.toHaveBeenCalled();
	});

	it('sends a save-story IPC message when a createPassage action is received', () => {
		saveMiddleware(
			storiesState,
			{
				type: 'createPassage',
				props: {name: storiesState[0].passages[0].name},
				storyId: storiesState[0].id
			},
			formatsState
		);
		expect(sendSpy.mock.calls).toEqual([
			['save-story', storiesState[0], formatsState[0], getAppInfo()]
		]);
	});

	it('sends a save-story IPC message when a createPassages action is received', () => {
		storiesState[0].passages.push(fakePassage());
		saveMiddleware(
			storiesState,
			{
				type: 'createPassages',
				props: [
					{name: storiesState[0].passages[0].name},
					{name: storiesState[0].passages[1].name}
				],
				storyId: storiesState[0].id
			},
			formatsState
		);
		expect(sendSpy.mock.calls).toEqual([
			['save-story', storiesState[0], formatsState[0], getAppInfo()]
		]);
	});

	describe('when a createStory action is received', () => {
		it('sends a save-story IPC message', () => {
			saveMiddleware(
				storiesState,
				{
					type: 'createStory',
					props: {name: storiesState[0].name}
				},
				formatsState
			);
			expect(sendSpy.mock.calls).toEqual([
				['save-story', storiesState[0], formatsState[0], getAppInfo()]
			]);
		});

		it('throws an error if the story created has no name', () =>
			expect(() =>
				saveMiddleware(
					storiesState,
					{
						type: 'createStory',
						props: {}
					},
					formatsState
				)
			).toThrow());

		it("throws an error if the story doesn't exist in state", () =>
			expect(() =>
				saveMiddleware(
					storiesState,
					{
						type: 'createStory',
						props: {name: 'bad'}
					},
					formatsState
				)
			).toThrow());
	});

	it('sends a save-story IPC message when a deletePassage action is received', () => {
		saveMiddleware(
			storiesState,
			{
				type: 'deletePassage',
				passageId: storiesState[0].passages[0].id,
				storyId: storiesState[0].id
			},
			formatsState
		);
		expect(sendSpy.mock.calls).toEqual([
			['save-story', storiesState[0], formatsState[0], getAppInfo()]
		]);
	});

	it('sends a save-story IPC message when a deletePassages action is received', () => {
		storiesState[0].passages.push(fakePassage());
		saveMiddleware(
			storiesState,
			{
				type: 'deletePassages',
				passageIds: [
					storiesState[0].passages[0].id,
					storiesState[0].passages[1].id
				],
				storyId: storiesState[0].id
			},
			formatsState
		);
		expect(sendSpy.mock.calls).toEqual([
			['save-story', storiesState[0], formatsState[0], getAppInfo()]
		]);
	});

	describe('when a deleteStory action is received', () => {
		// We need at least one action to be seen first so that the middleware can
		// save a cache of the state.

		beforeEach(() =>
			saveMiddleware(
				storiesState,
				{type: 'init', state: storiesState},
				formatsState
			)
		);

		it('sends a delete-story IPC message', () => {
			saveMiddleware(
				storiesState,
				{
					type: 'deleteStory',
					storyId: storiesState[0].id
				},
				formatsState
			);
			expect(sendSpy.mock.calls).toEqual([['delete-story', storiesState[0]]]);
		});

		it("throws an error if the story doesn't exist in state", () =>
			expect(() =>
				saveMiddleware(
					storiesState,
					{
						type: 'deleteStory',
						storyId: 'bad'
					},
					formatsState
				)
			).toThrow());
	});

	it('sends a save-story IPC message when an updatePassage action is received', () => {
		saveMiddleware(
			storiesState,
			{
				type: 'updatePassage',
				props: {name: storiesState[0].passages[0].name},
				passageId: storiesState[0].passages[0].id,
				storyId: storiesState[0].id
			},
			formatsState
		);
		expect(sendSpy.mock.calls).toEqual([
			['save-story', storiesState[0], formatsState[0], getAppInfo()]
		]);
	});

	it('sends a save-story IPC message when an updatePassages action is received', () => {
		storiesState[0].passages.push(fakePassage());
		saveMiddleware(
			storiesState,
			{
				type: 'updatePassages',
				passageUpdates: {
					[storiesState[0].passages[0].id]: {
						name: storiesState[0].passages[0].name
					},
					[storiesState[0].passages[1].id]: {
						name: storiesState[0].passages[1].name
					}
				},
				storyId: storiesState[0].id
			},
			formatsState
		);
		expect(sendSpy.mock.calls).toEqual([
			['save-story', storiesState[0], formatsState[0], getAppInfo()]
		]);
	});

	describe('when an updateStory action is received', () => {
		describe('when the story is being renamed', () => {
			// We need at least one action to be seen first so that the middleware can
			// save a cache of the state.

			beforeEach(() =>
				saveMiddleware(
					storiesState,
					{type: 'init', state: storiesState},
					formatsState
				)
			);

			it('sends a rename-story IPC message', () => {
				const origName = storiesState[0].name;

				storiesState[0] = {...storiesState[0], name: 'new-name'};
				saveMiddleware(
					storiesState,
					{
						type: 'updateStory',
						props: {name: 'new-name'},
						storyId: storiesState[0].id
					},
					formatsState
				);
				expect(sendSpy.mock.calls).toEqual([
					[
						'rename-story',
						{...storiesState[0], name: origName},
						storiesState[0]
					]
				]);
			});

			it('sends a save-story IPC message when the main process sends a story-renamed message', () => {
				saveMiddleware(
					storiesState,
					{
						type: 'updateStory',
						props: {name: 'new-name'},
						storyId: storiesState[0].id
					},
					formatsState
				);
				expect(onceSpy).toHaveBeenCalledTimes(1);
				expect(onceSpy.mock.calls[0][0]).toEqual('story-renamed');
				sendSpy.mockReset();
				onceSpy.mock.calls[0][1]();
				expect(sendSpy.mock.calls).toEqual([
					['save-story', storiesState[0], formatsState[0], getAppInfo()]
				]);
			});
		});

		describe('when other types of updates have occurred', () => {
			it('sends a save-story IPC message', () => {
				saveMiddleware(
					storiesState,
					{
						type: 'updateStory',
						props: {zoom: 1},
						storyId: storiesState[0].id
					},
					formatsState
				);
				expect(sendSpy.mock.calls).toEqual([
					['save-story', storiesState[0], formatsState[0], getAppInfo()]
				]);
			});
		});
	});

	it('logs a warning if an unexpected action is received', () => {
		saveMiddleware(storiesState, {type: '???'} as any, formatsState);
		expect(warnSpy).toHaveBeenCalledTimes(1);
		expect(sendSpy).not.toHaveBeenCalled();
	});
});
