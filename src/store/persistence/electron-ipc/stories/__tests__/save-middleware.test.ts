import {saveMiddleware} from '../save-middleware';
import {StoryFormatsState} from '../../../../story-formats';
import {StoriesAction, StoriesState} from '../../../../stories';
import {fakeLoadedStoryFormat, fakeStory} from '../../../../../test-util';
import {TwineElectronWindow} from '../../../../../electron/shared';
import {saveStory} from '../save-story';

jest.mock('../save-story');

describe('stories Electron IPC save middleware', () => {
	const saveStoryMock = saveStory as jest.Mock;
	let formatsState: StoryFormatsState;
	let onceSpy: jest.SpyInstance;
	let sendSpy: jest.SpyInstance;
	let storiesState: StoriesState;

	beforeEach(() => {
		formatsState = [fakeLoadedStoryFormat()];
		onceSpy = jest.fn();
		sendSpy = jest.fn();
		storiesState = [fakeStory(2)];
		storiesState[0].storyFormat = formatsState[0].name;
		storiesState[0].storyFormatVersion = formatsState[0].version;
		(window as any).twineElectron = {
			ipcRenderer: {once: onceSpy, send: sendSpy}
		};
		jest.spyOn(console, 'warn').mockReturnValue();

		// Certain actions need to see the state at least once first.

		saveMiddleware(
			storiesState,
			{
				type: 'init',
				state: storiesState
			},
			formatsState
		);
	});

	afterEach(() => delete (window as TwineElectronWindow).twineElectron);

	it.each([
		['init', () => ({type: 'init', state: []})],
		[
			'repair',
			() => ({
				type: 'repair',
				allFormats: formatsState,
				defaultFormat: formatsState[0]
			})
		]
	])('takes no action when a %s action is received', (_, action) => {
		saveMiddleware(storiesState, action() as StoriesAction, formatsState);
		expect(saveStoryMock).not.toHaveBeenCalled();
		expect(onceSpy).not.toHaveBeenCalled();
		expect(sendSpy).not.toHaveBeenCalled();
	});

	it.each([
		[
			'createPassage',
			() => ({
				type: 'createPassage',
				props: {name: storiesState[0].passages[0].name},
				storyId: storiesState[0].id
			})
		],
		[
			'createPassages',
			() => ({
				type: 'createPassages',
				props: {name: storiesState[0].passages[0].name},
				storyId: storiesState[0].id
			})
		],
		[
			'createStory',
			() => ({
				type: 'createStory',
				props: {name: storiesState[0].name}
			})
		],
		[
			'deletePassage',
			() => ({
				type: 'deletePassage',
				passageId: storiesState[0].passages[0].id,
				storyId: storiesState[0].id
			})
		],
		[
			'updatePassage',
			() => ({
				type: 'updatePassage',
				props: {name: storiesState[0].passages[0].name},
				passageId: storiesState[0].passages[0].id,
				storyId: storiesState[0].id
			})
		],
		[
			'updatePassages',
			() => ({
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
			})
		],
		[
			'non-name updateStory',
			() => ({
				type: 'updateStory',
				props: {zoom: 1},
				storyId: storiesState[0].id
			})
		]
	])('calls saveStory() when a %s action is received', (_, action) => {
		saveMiddleware(storiesState, action() as StoriesAction, formatsState);
		expect(saveStoryMock.mock.calls).toEqual([[storiesState[0], formatsState]]);
	});

	it('does nothing if a trivial updatePassage action is received', () => {
		saveMiddleware(
			storiesState,
			{
				type: 'updatePassage',
				passageId: storiesState[0].passages[0].id,
				props: {selected: true},
				storyId: storiesState[0].id
			},
			formatsState
		);
		expect(saveStoryMock).not.toHaveBeenCalled();
	});

	it('does nothing if a trivial updateStory action is received', () => {
		saveMiddleware(
			storiesState,
			{
				type: 'updateStory',
				props: {selected: true},
				storyId: storiesState[0].id
			},
			formatsState
		);
		expect(saveStoryMock).not.toHaveBeenCalled();
	});

	describe('when a createStory action is received', () => {
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

	describe('when a deleteStory action is received', () => {
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

	describe("when an updateStory action is received that changes a story's name", () => {
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
				['rename-story', {...storiesState[0], name: origName}, storiesState[0]]
			]);
		});

		it('calls saveStory() when the main process sends a story-renamed message', () => {
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
			saveStoryMock.mockReset();
			onceSpy.mock.calls[0][1]();
			expect(saveStoryMock.mock.calls).toEqual([
				[storiesState[0], formatsState]
			]);
		});
	});

	it('does nothing if an unexpected action is received', () => {
		saveMiddleware(storiesState, {type: '???'} as any, formatsState);
		expect(sendSpy).not.toHaveBeenCalled();
	});
});
