import {renderHook} from '@testing-library/react-hooks';
import CodeMirror from 'codemirror';
import {version as twineVersion} from '../../../package.json';
import {
	fakeFailedStoryFormat,
	fakeLoadedStoryFormat,
	fakePendingStoryFormat,
	fakePrefs,
	fakeUnloadedStoryFormat
} from '../../test-util';
import {usePrefsContext} from '../prefs';
import {
	loadFormatProperties,
	StoryFormat,
	useStoryFormatsContext
} from '../story-formats';
import {useFormatCodeMirrorMode} from '../use-format-codemirror-mode';

jest.mock('codemirror');
jest.mock('../prefs/prefs-context');
jest.mock('../story-formats/story-formats-context');
jest.mock('../story-formats/action-creators');

describe('useFormatCodeMirrorMode()', () => {
	const codeMirrorDefineModeMock = CodeMirror.defineMode as jest.Mock;
	const loadFormatPropertiesMock = loadFormatProperties as jest.Mock;
	let format: StoryFormat;
	let dispatchMock: jest.Mock;

	describe('when the format extensions are enabled', () => {
		beforeEach(() =>
			(usePrefsContext as jest.Mock).mockReturnValue({
				dispatch: jest.fn(),
				prefs: fakePrefs()
			})
		);

		describe('when the format is unloaded', () => {
			beforeEach(() => {
				dispatchMock = jest.fn();
				format = fakeUnloadedStoryFormat();
				loadFormatPropertiesMock.mockReturnValue({mockLoadFormatAction: true});
				(useStoryFormatsContext as jest.Mock).mockReturnValue({
					dispatch: dispatchMock,
					formats: [format]
				});
			});

			it('returns undefined', () =>
				expect(
					renderHook(() => useFormatCodeMirrorMode(format.name, format.version))
						.result.current
				).toBeUndefined());

			it('loads the format', () => {
				renderHook(() => useFormatCodeMirrorMode(format.name, format.version));
				expect(dispatchMock.mock.calls).toEqual([
					[{mockLoadFormatAction: true}]
				]);
				expect(loadFormatPropertiesMock.mock.calls).toEqual([[format]]);
			});
		});

		describe('when the format is loaded', () => {
			beforeEach(() => {
				dispatchMock = jest.fn();
				format = fakeLoadedStoryFormat();
				(useStoryFormatsContext as jest.Mock).mockReturnValue({
					dispatch: dispatchMock,
					formats: [format]
				});
			});

			describe('when the format has a CodeMirror mode', () => {
				const mockMode = {mockMode: true};

				beforeEach(() => {
					format.name = 'Predictable Name';
					format.version = '1.2.3';
					(format as any).properties.editorExtensions = {
						twine: {
							[twineVersion]: {
								codeMirror: {
									mode: mockMode
								}
							}
						}
					};
				});

				it('defines the mode in the global CodeMirror instance', () => {
					renderHook(() =>
						useFormatCodeMirrorMode(format.name, format.version)
					);
					expect(codeMirrorDefineModeMock.mock.calls).toEqual([
						['predictable-name-1.2.3', mockMode]
					]);
				});

				it('returns the name of the mode', () =>
					expect(
						renderHook(() =>
							useFormatCodeMirrorMode(format.name, format.version)
						).result.current
					).toBe('predictable-name-1.2.3'));
			});

			describe("when the format doesn't have a CodeMirror mode", () => {
				it('returns undefined', () => {
					jest.spyOn(console, 'info').mockReturnValue();
					expect(
						renderHook(() =>
							useFormatCodeMirrorMode(format.name, format.version)
						).result.current
					).toBeUndefined();
				});
			});
		});

		it('returns undefined if the format is loading', () => {
			format = fakePendingStoryFormat();
			(useStoryFormatsContext as jest.Mock).mockReturnValue({
				dispatch: dispatchMock,
				formats: [format]
			});

			expect(
				renderHook(() => useFormatCodeMirrorMode(format.name, format.version))
					.result.current
			).toBeUndefined();
		});

		it('returns undefined if the format failed to load', () => {
			format = fakeFailedStoryFormat();
			(useStoryFormatsContext as jest.Mock).mockReturnValue({
				dispatch: dispatchMock,
				formats: [format]
			});

			expect(
				renderHook(() => useFormatCodeMirrorMode(format.name, format.version))
					.result.current
			).toBeUndefined();
		});

		it('throws an error if a nonexistent format is requested', () =>
			expect(
				renderHook(() => useFormatCodeMirrorMode('nonexistent', '1.0.0')).result
					.error
			).not.toBeUndefined());
	});

	describe('when the format extensions are disabled', () => {
		describe('when the format is unloaded', () => {
			beforeEach(() => {
				dispatchMock = jest.fn();
				format = fakeUnloadedStoryFormat();
				(useStoryFormatsContext as jest.Mock).mockReturnValue({
					dispatch: dispatchMock,
					formats: [format]
				});
				(usePrefsContext as jest.Mock).mockReturnValue({
					dispatch: jest.fn(),
					prefs: fakePrefs({
						disabledStoryFormatEditorExtensions: [
							{name: format.name, version: format.version}
						]
					})
				});
			});

			it('returns undefined', () => {
				const {result} = renderHook(() =>
					useFormatCodeMirrorMode(format.name, format.version)
				);

				expect(result.current).toBeUndefined();
			});

			it('does not load the format', () => {
				renderHook(() => useFormatCodeMirrorMode(format.name, format.version));
				expect(dispatchMock).not.toHaveBeenCalled();
			});
		});

		it('returns undefined when the format is loaded', () => {
			dispatchMock = jest.fn();
			format = fakeLoadedStoryFormat();
			(useStoryFormatsContext as jest.Mock).mockReturnValue({
				dispatch: dispatchMock,
				formats: [format]
			});
			(usePrefsContext as jest.Mock).mockReturnValue({
				dispatch: jest.fn(),
				prefs: fakePrefs({
					disabledStoryFormatEditorExtensions: [
						{name: format.name, version: format.version}
					]
				})
			});

			expect(
				renderHook(() => useFormatCodeMirrorMode(format.name, format.version))
					.result.current
			).toBeUndefined();
		});

		it('returns undefined when the format is loading', () => {
			dispatchMock = jest.fn();
			format = fakePendingStoryFormat();
			(useStoryFormatsContext as jest.Mock).mockReturnValue({
				dispatch: dispatchMock,
				formats: [format]
			});
			(usePrefsContext as jest.Mock).mockReturnValue({
				dispatch: jest.fn(),
				prefs: fakePrefs({
					disabledStoryFormatEditorExtensions: [
						{name: format.name, version: format.version}
					]
				})
			});

			expect(
				renderHook(() => useFormatCodeMirrorMode(format.name, format.version))
					.result.current
			).toBeUndefined();
		});

		it('returns undefined if the format failed to load', () => {
			dispatchMock = jest.fn();
			format = fakeFailedStoryFormat();
			(useStoryFormatsContext as jest.Mock).mockReturnValue({
				dispatch: dispatchMock,
				formats: [format]
			});
			(usePrefsContext as jest.Mock).mockReturnValue({
				dispatch: jest.fn(),
				prefs: fakePrefs({
					disabledStoryFormatEditorExtensions: [
						{name: format.name, version: format.version}
					]
				})
			});

			expect(
				renderHook(() => useFormatCodeMirrorMode(format.name, format.version))
					.result.current
			).toBeUndefined();
		});
	});
});
