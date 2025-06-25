import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	PrefInspector,
	StoryInspector
} from '../../../../../test-util';
import {TagStoryButton, TagStoryButtonProps} from '../tag-story-button';

jest.mock('../../../../../components/tag/tag-card-button');

const TestTagStoryButton: React.FC<TagStoryButtonProps> = props => {
	const {stories} = useStoriesContext();

	return <TagStoryButton story={stories[0]} {...props} />;
};

describe('<TagStoryButton>', () => {
	function renderComponent(
		props?: Partial<TagStoryButtonProps>,
		contexts?: FakeStateProviderProps
	) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestTagStoryButton {...props} />
				<PrefInspector name="storyTagColors" />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	it('is disabled if no story is set', () => {
		renderComponent({story: undefined});
		expect(screen.getByText('onAdd')).toBeDisabled();
	});

	it('adds a tag to the story', () => {
		renderComponent();
		expect(screen.getByTestId('story-inspector-default').dataset.tags).toBe('');
		fireEvent.click(screen.getByText('onAdd'));
		expect(screen.getByTestId('story-inspector-default').dataset.tags).toBe(
			'mock-tag-name'
		);
	});

	it('removes a tag from a story', () => {
		const story = fakeStory();

		story.tags = ['mock-tag-name'];
		renderComponent({story}, {stories: [story]});
		expect(screen.getByTestId('story-inspector-default').dataset.tags).toBe(
			'mock-tag-name'
		);
		fireEvent.click(screen.getByText('onRemove'));
		expect(screen.getByTestId('story-inspector-default').dataset.tags).toBe('');
	});

	it("changes a tag's color", () => {
		const storyTagColors = {'mock-tag-name': 'blue', unrelated: 'red'};

		renderComponent(
			{story: fakeStory()},
			{prefs: {storyTagColors: {'mock-tag-name': 'blue', unrelated: 'red'}}}
		);
		expect(
			screen.getByTestId('pref-inspector-storyTagColors')
		).toHaveTextContent(JSON.stringify(storyTagColors));
		fireEvent.click(screen.getByText('onChangeColor'));
		expect(
			screen.getByTestId('pref-inspector-storyTagColors')
		).toHaveTextContent(
			JSON.stringify({...storyTagColors, 'mock-tag-name': 'mock-changed-color'})
		);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
