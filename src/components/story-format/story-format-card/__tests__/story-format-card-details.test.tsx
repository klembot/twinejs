import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {StoryFormat} from '../../../../store/story-formats';
import {
	fakeFailedStoryFormat,
	fakeLoadedStoryFormat,
	fakePendingStoryFormat,
	fakeUnloadedStoryFormat
} from '../../../../test-util';
import {
	StoryFormatCardDetails,
	StoryFormatCardDetailsProps
} from '../story-format-card-details';

describe('<StoryFormatCardDetails>', () => {
	function renderComponent(props?: Partial<StoryFormatCardDetailsProps>) {
		return render(
			<StoryFormatCardDetails format={fakeLoadedStoryFormat()} {...props} />
		);
	}

	it('displays a loading message if the format is unloaded', () => {
		renderComponent({format: fakeUnloadedStoryFormat()});
		expect(
			screen.getByText('components.storyFormatCard.loadingFormat')
		).toBeInTheDocument();
	});

	it('displays a loading message if the format is loading', () => {
		renderComponent({format: fakePendingStoryFormat()});
		expect(
			screen.getByText('components.storyFormatCard.loadingFormat')
		).toBeInTheDocument();
	});

	it('displays an error message if the format failed to load', () => {
		renderComponent({format: fakeFailedStoryFormat()});
		expect(
			screen.getByText('components.storyFormatCard.loadError')
		).toBeInTheDocument();
	});

	describe('when the format is loaded', () => {
		let format: StoryFormat;

		beforeEach(() => {
			format = fakeLoadedStoryFormat();
			renderComponent({format});
		});

		it('displays the format author', () =>
			expect(
				screen.getByText('components.storyFormatCard.author')
			).toBeInTheDocument());

		it('displays the format description', () =>
			expect(
				screen.getByText((format as any).properties.description)
			).toBeInTheDocument());

		it('displays the format license', () =>
			expect(
				screen.getByText('components.storyFormatCard.license')
			).toBeInTheDocument());
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
