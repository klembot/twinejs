import {version as twineVersion} from '../../../../package.json';
import {renderHook} from '@testing-library/react-hooks';
import {useFormatReferenceParser} from '../use-format-reference-parser';
import {
	fakeFailedStoryFormat,
	fakeLoadedStoryFormat,
	fakePendingStoryFormat,
	fakeUnloadedStoryFormat
} from '../../../test-util/fakes';
import {useStoryFormatsContext} from '../story-formats-context';
import {loadFormatProperties} from '../action-creators';
import {StoryFormat} from '../story-formats.types';

jest.mock('../story-formats-context');
jest.mock('../action-creators');

describe('useFormatReferenceParser()', () => {
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

		it('returns a function returning an empty array', () => {
			const {result} = renderHook(() =>
				useFormatReferenceParser(format.name, format.version)
			);

			expect(result.current('')).toEqual([]);
		});

		it('loads the format', () => {
			renderHook(() => useFormatReferenceParser(format.name, format.version));
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

		it('returns its reference parser if defined', () => {
			const parsePassageText = jest.fn();

			format.name = 'Predictable Name';
			format.version = '1.2.3';
			(format as any).properties.editorExtensions = {
				twine: {
					[twineVersion]: {
						references: {parsePassageText}
					}
				}
			};

			const {result} = renderHook(() =>
				useFormatReferenceParser(format.name, format.version)
			);

			expect(result.current).toBe(parsePassageText);
		});

		it('retuns a function returning an empty array if a reference parser is not defined', () => {
			jest.spyOn(console, 'info').mockReturnValue();

			const {result} = renderHook(() =>
				useFormatReferenceParser(format.name, format.version)
			);

			expect(result.current('')).toEqual([]);
		});
	});

	it('returns a function returning an empty array while the format is loading', () => {
		format = fakePendingStoryFormat();
		(useStoryFormatsContext as jest.Mock).mockReturnValue({
			dispatch: dispatchMock,
			formats: [format]
		});

		const {result} = renderHook(() =>
			useFormatReferenceParser(format.name, format.version)
		);

		expect(result.current('')).toEqual([]);
	});

	it('returns a function returning an empty array if the format failed to load', () => {
		format = fakeFailedStoryFormat();
		(useStoryFormatsContext as jest.Mock).mockReturnValue({
			dispatch: dispatchMock,
			formats: [format]
		});

		const {result} = renderHook(() =>
			useFormatReferenceParser(format.name, format.version)
		);

		expect(result.current('')).toEqual([]);
	});

	it('throws an error if a nonexistent format is requested', () => {
		expect(
			renderHook(() => useFormatReferenceParser('nonexistent', '1.0.0')).result
				.error
		).not.toBeUndefined();
	});
});
