import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {maxZoom, minZoom, useStoriesContext} from '../../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../../../test-util';
import {ZoomButtons, ZoomButtonsProps} from '../zoom-buttons';

const TestZoomButtons: React.FC = () => {
	const {stories} = useStoriesContext();

	return <ZoomButtons story={stories[0]} />;
};

describe('<ZoomButtons>', () => {
	function renderComponent(contexts?: FakeStateProviderProps) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestZoomButtons />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	it('zooms the story in 20% when the zoom in button is clicked', () => {
		const story = fakeStory();

		story.zoom = 0.5;
		renderComponent({stories: [story]});
		fireEvent.click(screen.getByText('routes.storyEdit.topBar.zoomIn'));
		expect(screen.getByTestId('story-inspector-default').dataset.zoom).toBe(
			'0.7'
		);
	});

	it('disables the zoom in button when the story is as zoomed in as possible', () => {
		const story = fakeStory();

		story.zoom = maxZoom;
		renderComponent({stories: [story]});
		expect(screen.getByText('routes.storyEdit.topBar.zoomIn')).toBeDisabled();
	});

	it('disables the zoom in button when the story is above max zoom', () => {
		const story = fakeStory();

		story.zoom = maxZoom + 0.1;
		renderComponent({stories: [story]});
		expect(screen.getByText('routes.storyEdit.topBar.zoomIn')).toBeDisabled();
	});

	it('zooms the story out 20% when the zoom out button is clicked', () => {
		const story = fakeStory();

		story.zoom = 0.5;
		renderComponent({stories: [story]});
		fireEvent.click(screen.getByText('routes.storyEdit.topBar.zoomOut'));
		expect(screen.getByTestId('story-inspector-default').dataset.zoom).toBe(
			'0.3'
		);
	});

	it('disables the zoom in button when the story is as zoomed out as possible', () => {
		const story = fakeStory();

		story.zoom = minZoom;
		renderComponent({stories: [story]});
		expect(screen.getByText('routes.storyEdit.topBar.zoomOut')).toBeDisabled();
	});

	it('disables the zoom in button when the story is below min zoom', () => {
		const story = fakeStory();

		story.zoom = minZoom - 0.1;
		renderComponent({stories: [story]});
		expect(screen.getByText('routes.storyEdit.topBar.zoomOut')).toBeDisabled();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
