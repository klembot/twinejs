import {version as twineVersion} from '../../../../package.json';
import CodeMirror from 'codemirror';
import {renderHook} from '@testing-library/react-hooks';
import {useFormatCodeMirrorMode} from '..';
import {
	fakeFailedStoryFormat,
	fakeLoadedStoryFormat,
	fakePendingStoryFormat,
	fakeUnloadedStoryFormat
} from '../../../test-util/fakes';
import {useStoryFormatsContext} from '../story-formats-context';
import {loadFormatProperties} from '../action-creators';
import {StoryFormat} from '../story-formats.types';

jest.mock('codemirror');
jest.mock('../story-formats-context');
jest.mock('../action-creators');

describe('useFormatCodeMirrorMode()', () => {
	const codeMirrorDefineModeMock = CodeMirror.defineMode as jest.Mock;
	const loadFormatPropertiesMock = loadFormatProperties as jest.Mock;
	let format: StoryFormat;
	let dispatchMock: jest.Mock;

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
			expect(dispatchMock.mock.calls).toEqual([[{mockLoadFormatAction: true}]]);
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
				renderHook(() => useFormatCodeMirrorMode(format.name, format.version));
				expect(codeMirrorDefineModeMock.mock.calls).toEqual([
					['predictable-name-1.2.3', mockMode]
				]);
			});

			it('returns the name of the mode', () =>
				expect(
					renderHook(() => useFormatCodeMirrorMode(format.name, format.version))
						.result.current
				).toBe('predictable-name-1.2.3'));
		});

		describe("when the format doesn't have a CodeMirror mode", () => {
			it('returns undefined', () => {
				jest.spyOn(console, 'info').mockReturnValue();
				expect(
					renderHook(() => useFormatCodeMirrorMode(format.name, format.version))
						.result.current
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
