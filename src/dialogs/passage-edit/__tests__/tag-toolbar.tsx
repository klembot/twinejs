import {fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../../test-util';
import {TagToolbar} from '../tag-toolbar';

jest.mock('../../../components/tag/add-tag-button');
jest.mock('../../../components/tag/tag-button');

const TestTagToolbar: React.FC = () => {
	const {stories} = useStoriesContext();

	return <TagToolbar passage={stories[0].passages[0]} story={stories[0]} />;
};

describe('<TagToolbar>', () => {
	function renderComponent(context?: Partial<FakeStateProviderProps>) {
		return render(
			<FakeStateProvider {...context}>
				<TestTagToolbar />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	it('displays passage tags', () => {
		const story = fakeStory(1);

		story.passages[0].tags = ['mock-tag', 'mock-tag2'];
		renderComponent({stories: [story]});
		expect(screen.getByTestId('mock-tag-button-mock-tag')).toBeInTheDocument();
		expect(screen.getByTestId('mock-tag-button-mock-tag2')).toBeInTheDocument();
	});

	it("changes a tag's color when the user changes it", () => {
		const story = fakeStory(1);

		story.passages[0].tags = ['mock-tag'];
		story.tagColors = {'mock-tag': 'red'};
		renderComponent({stories: [story]});
		fireEvent.click(
			within(screen.getByTestId('mock-tag-button-mock-tag')).getByText(
				'onChangeColor'
			)
		);
		expect(
			JSON.parse(
				screen.getByTestId('story-inspector-default').dataset.tagColors!
			)
		).toEqual({'mock-tag': 'mock-color'});
	});

	it('removes a tag when the user removes it', async () => {
		const story = fakeStory(1);

		story.passages[0].tags = ['mock-tag'];
		renderComponent({stories: [story]});
		expect(
			screen.getByTestId(`passage-${story.passages[0].id}`).dataset.tags
		).toBe('mock-tag');
		fireEvent.click(
			within(screen.getByTestId('mock-tag-button-mock-tag')).getByText(
				'onRemove'
			)
		);
		expect(
			screen.getByTestId(`passage-${story.passages[0].id}`).dataset.tags
		).toBe('');
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
