import {renderHook} from '@testing-library/react-hooks';
import CodeMirror from 'codemirror';
import {version as twineVersion} from '../../../package.json';
import {
	fakeLoadedStoryFormat,
	fakePrefs,
	fakeUnloadedStoryFormat
} from '../../test-util';
import {usePrefsContext} from '../prefs';
import {
	loadFormatProperties,
	StoryFormat,
	useStoryFormatsContext
} from '../story-formats';
import {useFormatCodeMirrorToolbar} from '../use-format-codemirror-toolbar';

jest.mock('codemirror');
jest.mock('../prefs/prefs-context');
jest.mock('../story-formats/story-formats-context');
jest.mock('../story-formats/action-creators');
jest.mock('../../util/story-format/namespace');

describe('useFormatCodeMirrorToolbar()', () => {
	const loadFormatPropertiesMock = loadFormatProperties as jest.Mock;
	let format: StoryFormat;
	let dispatchMock: jest.Mock;

	beforeEach(() => {
		(CodeMirror.commands as any) = {};
		dispatchMock = jest.fn();
	});

	describe('when the format extensions are enabled', () => {
		beforeEach(() =>
			(usePrefsContext as jest.Mock).mockReturnValue({
				dispatch: jest.fn(),
				prefs: fakePrefs()
			})
		);

		describe('when the format is unloaded', () => {
			beforeEach(() => {
				format = fakeUnloadedStoryFormat();
				loadFormatPropertiesMock.mockReturnValue({mockLoadFormatAction: true});
				(useStoryFormatsContext as jest.Mock).mockReturnValue({
					dispatch: dispatchMock,
					formats: [format]
				});
			});

			it('returns undefined', () =>
				expect(
					renderHook(() =>
						useFormatCodeMirrorToolbar(format.name, format.version)
					).result.current
				).toBeUndefined());

			it('loads the format', () => {
				renderHook(() =>
					useFormatCodeMirrorToolbar(format.name, format.version)
				);
				expect(dispatchMock.mock.calls).toEqual([
					[{mockLoadFormatAction: true}]
				]);
				expect(loadFormatPropertiesMock.mock.calls).toEqual([[format]]);
			});
		});

		describe('when the format is loaded', () => {
			const mockCommands = {mockCommand: jest.fn()};
			const mockToolbarFunction = jest.fn();

			beforeEach(() => {
				format = fakeLoadedStoryFormat();
				format.name = 'Predictable Name';
				format.version = '1.2.3';
				(format as any).properties.editorExtensions = {
					twine: {
						[twineVersion]: {
							codeMirror: {
								commands: mockCommands,
								toolbar: mockToolbarFunction
							}
						}
					}
				};
				(useStoryFormatsContext as jest.Mock).mockReturnValue({
					dispatch: dispatchMock,
					formats: [format]
				});
			});

			it('adds CodeMirror commands defined by the format, namespacing them', () => {
				renderHook(() =>
					useFormatCodeMirrorToolbar(format.name, format.version)
				);
				expect((CodeMirror.commands as any).mockNamespacemockCommand).toBe(
					mockCommands.mockCommand
				);
			});

			it('does not overwrite existing CodeMirror commands', () => {
				jest.spyOn(console, 'warn').mockReturnValue();

				const origCommand = jest.fn();

				(CodeMirror.commands as any).mockNamespacemockCommand = origCommand;
				renderHook(() =>
					useFormatCodeMirrorToolbar(format.name, format.version)
				);
				expect((CodeMirror.commands as any).mockNamespacemockCommand).toBe(
					origCommand
				);
			});

			describe('the function it returns', () => {
				it('calls the CodeMirror toolbar function if defined', () => {
					const {result} = renderHook(() =>
						useFormatCodeMirrorToolbar(format.name, format.version)
					);

					expect(mockToolbarFunction).not.toHaveBeenCalled();
					(result.current as any)();
					expect(mockToolbarFunction).toHaveBeenCalledTimes(1);
				});

				it("namespaces command names in the toolbar function's return value", () => {
					((format as any).properties.editorExtensions.twine[twineVersion]
						.codeMirror.toolbar as jest.Mock).mockReturnValue([
						{type: 'button', command: 'mockCommand'},
						{type: 'menu', items: [{type: 'button', command: 'mockCommand2'}]}
					]);

					const {result} = renderHook(() =>
						useFormatCodeMirrorToolbar(format.name, format.version)
					);

					const items = (result.current as any)();

					expect(items).toEqual([
						{type: 'button', command: 'mockNamespacemockCommand'},
						{
							type: 'menu',
							items: [{type: 'button', command: 'mockNamespacemockCommand2'}]
						}
					]);
				});

				it('ignores submenus', () => {
					((format as any).properties.editorExtensions.twine[twineVersion]
						.codeMirror.toolbar as jest.Mock).mockReturnValue([
						{
							type: 'menu',
							items: [
								{
									type: 'menu',
									items: [{type: 'button', command: 'mockCommand2'}]
								}
							]
						}
					]);

					const {result} = renderHook(() =>
						useFormatCodeMirrorToolbar(format.name, format.version)
					);

					const items = (result.current as any)();

					expect(items).toEqual([{type: 'menu', items: []}]);
				});

				it('ignores separators outside of a menu', () => {
					((format as any).properties.editorExtensions.twine[twineVersion]
						.codeMirror.toolbar as jest.Mock).mockReturnValue([
						{type: 'separator'}
					]);

					const {result} = renderHook(() =>
						useFormatCodeMirrorToolbar(format.name, format.version)
					);

					const items = (result.current as any)();

					expect(items).toEqual([]);
				});
			});
		});
	});
});
