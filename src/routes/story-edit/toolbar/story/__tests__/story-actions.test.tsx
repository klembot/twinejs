import {act, fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../../../../test-util';
import {StoryActions} from '../story-actions';

jest.mock('../../../../../components/story/rename-story-button');

const TestStoryActions: React.FC = () => {
	const {stories} = useStoriesContext();

	return <StoryActions story={stories[0]} />;
};

describe('<StoryActions>', () => {
	async function renderComponent(contexts?: FakeStateProviderProps) {
		const result = render(
			<FakeStateProvider {...contexts}>
				<TestStoryActions />
				<StoryInspector />
			</FakeStateProvider>
		);

		await act(() => Promise.resolve());
		return result;
	}

	it('displays a find/replace button', async () => {
		await renderComponent();
		expect(
			screen.getByText('routes.storyEdit.toolbar.findAndReplace')
		).toBeInTheDocument();
	});

	it('displays a story rename button that renames the story', async () => {
		const story = fakeStory();

		await renderComponent({stories: [story]});
		fireEvent.click(screen.getByText(`mock-rename-story-button-${story.id}`));
		expect(screen.getByTestId('story-inspector-default').dataset.name).toBe(
			'mock-new-name'
		);
	});

	it('displays a story details button', async () => {
		await renderComponent();
		expect(screen.getByText('common.details')).toBeInTheDocument();
	});

	it('displays a passage tags button', async () => {
		await renderComponent();
		expect(
			screen.getByText('routes.storyEdit.toolbar.passageTags')
		).toBeInTheDocument();
	});

	it('displays a story JavaScript button', async () => {
		await renderComponent();
		expect(
			screen.getByText('routes.storyEdit.toolbar.javaScript')
		).toBeInTheDocument();
	});

	it('displays a story stylesheet button', async () => {
		await renderComponent();
		expect(
			screen.getByText('routes.storyEdit.toolbar.stylesheet')
		).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
