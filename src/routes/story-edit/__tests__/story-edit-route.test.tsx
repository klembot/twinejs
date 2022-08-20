import {act, render, screen} from '@testing-library/react';
import {createMemoryHistory} from 'history';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Helmet} from 'react-helmet';
import {Route, Router} from 'react-router-dom';
import {Story, useStoriesContext} from '../../../store/stories';
import {
	fakeLoadedStoryFormat,
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../../test-util';
import {InnerStoryEditRoute} from '../story-edit-route';
import {useZoomShortcuts} from '../use-zoom-shortcuts';

jest.mock('../toolbar/story-edit-toolbar');
jest.mock('../use-zoom-shortcuts');
jest.mock('../../../components/passage/passage-map/passage-map');

const TestStoryEditRoute: React.FC = () => {
	const {stories} = useStoriesContext();

	return (
		<Router
			history={createMemoryHistory({
				initialEntries: [`/stories/${stories[0].id}`]
			})}
		>
			<Route path="/stories/:storyId">
				<InnerStoryEditRoute />
				<StoryInspector />
			</Route>
		</Router>
	);
};

describe('<StoryEditRoute>', () => {
	const useZoomShortcutsMock = useZoomShortcuts as jest.Mock;

	async function renderComponent(
		story: Story,
		contexts?: FakeStateProviderProps
	) {
		const format = fakeLoadedStoryFormat();

		format.name = story.storyFormat;
		format.version = story.storyFormatVersion;

		jest.useFakeTimers();

		const result = render(
			<FakeStateProvider
				{...contexts}
				stories={[story]}
				storyFormats={[format]}
			>
				<TestStoryEditRoute />
			</FakeStateProvider>
		);

		act(() => {
			jest.runAllTimers();
		});

		jest.useRealTimers();

		// Need this because of <PromptButton>
		await act(async () => Promise.resolve());
		return result;
	}

	it('sets the document title to the story name', async () => {
		const story = fakeStory();

		await renderComponent(story);
		expect(Helmet.peek().title).toBe(story.name);
	});

	it('displays the toolbar', async () => {
		await renderComponent(fakeStory());
		expect(screen.getByTestId('mock-story-edit-toolbar')).toBeInTheDocument();
	});

	it('displays a passage map', async () => {
		await renderComponent(fakeStory());
		expect(screen.getByTestId('mock-passage-map')).toBeInTheDocument();
	});

	it('displays zoom buttons', async () => {
		await renderComponent(fakeStory());

		expect(
			screen.getByLabelText(
				'routes.storyEdit.zoomButtons.passageNamesAndExcerpts'
			)
		).toBeInTheDocument();
	});

	it('creates a passage automatically if the story has none', async () => {
		await renderComponent(fakeStory(0));
		expect(screen.getAllByTestId(/^passage-/).length).toBe(1);
	});

	it('sets up zoom keyboard shortcuts', async () => {
		await renderComponent(fakeStory());
		expect(useZoomShortcutsMock).toBeCalled();
	});

	it('is accessible', async () => {
		const {container} = await renderComponent(fakeStory());

		expect(await axe(container)).toHaveNoViolations();
	});
});
