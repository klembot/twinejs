import {render, screen} from '@testing-library/react';
import {
	loadAllFormatProperties,
	StoryFormat,
	useStoryFormatsContext
} from '../story-formats';
import {FormatLoader} from '../format-loader';
import {
	fakeFailedStoryFormat,
	fakeLoadedStoryFormat,
	fakeUnloadedStoryFormat
} from '../../test-util';

jest.mock('../story-formats/story-formats-context');
jest.mock('../story-formats/action-creators');

describe('<FormatLoader>', () => {
	const loadAllFormatPropertiesMock = loadAllFormatProperties as jest.Mock;
	let formatsDispatchSpy: jest.SpyInstance;
	let formats: StoryFormat[];

	beforeEach(() => {
		formatsDispatchSpy = jest.fn();
		formats = [
			fakeUnloadedStoryFormat(),
			fakeLoadedStoryFormat(),
			fakeFailedStoryFormat(),
			fakeUnloadedStoryFormat()
		];
		(useStoryFormatsContext as jest.Mock).mockReturnValue({
			dispatch: formatsDispatchSpy,
			formats
		});
	});

	it('dispatches a loadAllFormatProperties action for formats initially', () => {
		render(<FormatLoader />);
		expect(loadAllFormatPropertiesMock.mock.calls).toEqual([[formats]]);
	});

	it('dispatches another loadAllFormatProperties action if new formats appear in context', () => {
		const newFormat = fakeUnloadedStoryFormat();
		const {rerender} = render(<FormatLoader />);

		loadAllFormatPropertiesMock.mockClear();
		(useStoryFormatsContext as jest.Mock).mockReturnValue({
			dispatch: formatsDispatchSpy,
			formats: [...formats, newFormat]
		});
		rerender(<FormatLoader />);
		expect(loadAllFormatPropertiesMock.mock.calls).toEqual([[[newFormat]]]);
	});

	describe('when the block prop is true', () => {
		it('renders a loading meter if not all formats have loaded', () => {
			render(<FormatLoader block />);

			const meter = screen.getByRole('meter');

			expect(meter).toBeInTheDocument();
			expect(meter.getAttribute('aria-valuenow')).toBe('25');
		});

		it('renders children once all formats have loaded', () => {
			(useStoryFormatsContext as jest.Mock).mockReturnValue({
				dispatch: formatsDispatchSpy,
				formats: [fakeLoadedStoryFormat(), fakeLoadedStoryFormat()]
			});

			render(
				<FormatLoader>
					<div data-testid="child" />
				</FormatLoader>
			);
			expect(screen.getByTestId('child')).toBeInTheDocument();
		});
	});

	describe('when the block prop is false', () => {
		it('renders children regardless of load status of formats', () => {
			render(
				<FormatLoader>
					<div data-testid="child" />
				</FormatLoader>
			);
			expect(screen.getByTestId('child')).toBeInTheDocument();
		});
	});
});
