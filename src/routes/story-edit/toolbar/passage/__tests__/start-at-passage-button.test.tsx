import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../../../../test-util';
import {
	StartAtPassageButton,
	StartAtPassageButtonProps
} from '../start-at-passage-button';

const TestStartAtPassageButton: React.FC<
	Partial<StartAtPassageButtonProps>
> = props => {
	const {stories} = useStoriesContext();

	return <StartAtPassageButton story={stories[0]} {...props} />;
};

describe('<StartAtPassageButton>', () => {
	function renderComponent(
		props?: Partial<StartAtPassageButtonProps>,
		contexts?: FakeStateProviderProps
	) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestStartAtPassageButton {...props} />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	it('is disabled if the passage prop is undefined', () => {
		renderComponent({passage: undefined});
		expect(
			screen.getByText('routes.storyEdit.toolbar.startStoryHere')
		).toBeDisabled();
	});

	it('is disabled if the passage is already the starting point', () => {
		const story = fakeStory(2);

		story.startPassage = story.passages[0].id;

		renderComponent({story, passage: story.passages[0]}, {stories: [story]});
		expect(
			screen.getByText('routes.storyEdit.toolbar.startStoryHere')
		).toBeDisabled();
	});

	it('sets the passage as starting point when clicked', () => {
		const story = fakeStory(2);

		story.startPassage = story.passages[1].id;

		renderComponent({story, passage: story.passages[0]}, {stories: [story]});
		expect(
			screen.getByTestId('story-inspector-default').dataset.startPassage
		).toBe(story.passages[1].id);
		fireEvent.click(
			screen.getByText('routes.storyEdit.toolbar.startStoryHere')
		);
		expect(
			screen.getByTestId('story-inspector-default').dataset.startPassage
		).toBe(story.passages[0].id);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
