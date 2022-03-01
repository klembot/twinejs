import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../../test-util';
import {ZoomButtons} from '../zoom-buttons';

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

	it('displays a button that sets the story zoom to 1', () => {
		const story = fakeStory();

		story.zoom = 0.6;
		renderComponent({stories: [story]});
		fireEvent.click(
			screen.getByLabelText(
				'routes.storyEdit.zoomButtons.passageNamesAndExcerpts'
			)
		);
		expect(screen.getByTestId('story-inspector-default').dataset.zoom).toBe(
			'1'
		);
	});

	it('presses the zoom 1 button if the story has that zoom', () => {
		const story = fakeStory();

		story.zoom = 1;
		renderComponent({stories: [story]});
		expect(
			screen.getByLabelText(
				'routes.storyEdit.zoomButtons.passageNamesAndExcerpts'
			)
		).toHaveAttribute('aria-pressed', 'true');
	});

	it("doesn't press the zoom 1 button if the story doesn't have that zoom", () => {
		const story = fakeStory();

		story.zoom = 0.6;
		renderComponent({stories: [story]});
		expect(
			screen.getByLabelText(
				'routes.storyEdit.zoomButtons.passageNamesAndExcerpts'
			)
		).toHaveAttribute('aria-pressed', 'false');
	});

	it('displays a button that sets the story zoom to 0.6', () => {
		const story = fakeStory();

		story.zoom = 1;
		renderComponent({stories: [story]});
		fireEvent.click(
			screen.getByLabelText('routes.storyEdit.zoomButtons.passageNames')
		);
		expect(screen.getByTestId('story-inspector-default').dataset.zoom).toBe(
			'0.6'
		);
	});

	it('presses the zoom 0.6 button if the story has that zoom', () => {
		const story = fakeStory();

		story.zoom = 0.6;
		renderComponent({stories: [story]});
		expect(
			screen.getByLabelText('routes.storyEdit.zoomButtons.passageNames')
		).toHaveAttribute('aria-pressed', 'true');
	});

	it("doesn't press the zoom 0.6 button if the story doesn't have that zoom", () => {
		const story = fakeStory();

		story.zoom = 1;
		renderComponent({stories: [story]});
		expect(
			screen.getByLabelText('routes.storyEdit.zoomButtons.passageNames')
		).toHaveAttribute('aria-pressed', 'false');
	});

	it('displays a button that sets the story zoom to 0.3', () => {
		const story = fakeStory();

		story.zoom = 1;
		renderComponent({stories: [story]});
		fireEvent.click(
			screen.getByLabelText('routes.storyEdit.zoomButtons.storyStructure')
		);
		expect(screen.getByTestId('story-inspector-default').dataset.zoom).toBe(
			'0.3'
		);
	});

	it('presses the zoom 0.3 button if the story has that zoom', () => {
		const story = fakeStory();

		story.zoom = 0.3;
		renderComponent({stories: [story]});
		expect(
			screen.getByLabelText('routes.storyEdit.zoomButtons.storyStructure')
		).toHaveAttribute('aria-pressed', 'true');
	});

	it("doesn't press the zoom 0.3 button if the story doesn't have that zoom", () => {
		const story = fakeStory();

		story.zoom = 1;
		renderComponent({stories: [story]});
		expect(
			screen.getByLabelText('routes.storyEdit.zoomButtons.storyStructure')
		).toHaveAttribute('aria-pressed', 'false');
	});

	it('is accessible', async () => {
		const {container} = renderComponent();
		expect(await axe(container)).toHaveNoViolations();
	});
});
