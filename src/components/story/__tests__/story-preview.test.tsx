import {render} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakeStory} from '../../../test-util';
import {StoryPreview, StoryPreviewProps} from '../story-preview';

describe('<StoryPreview>', () => {
	function renderComponent(props?: Partial<StoryPreviewProps>) {
		return render(<StoryPreview story={fakeStory(5)} {...props} />);
	}

	it('renders SVG', () => {
		renderComponent();
		expect(document.body.querySelector('svg')).toBeInTheDocument();
	});

	it('renders SVG even if the story has no passages', () => {
		renderComponent({story: fakeStory(0)});
		expect(document.body.querySelector('svg')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
