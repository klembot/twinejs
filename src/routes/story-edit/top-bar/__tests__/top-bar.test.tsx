import {fireEvent, render, screen} from '@testing-library/react';
import {createMemoryHistory, MemoryHistory} from 'history';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Router} from 'react-router-dom';
import {useStoriesContext} from '../../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory
} from '../../../../test-util';
import {StoryEditTopBar} from '../top-bar';

const TestStoryEditTopBar: React.FC = () => {
	const {stories} = useStoriesContext();

	return <StoryEditTopBar getCenter={jest.fn()} story={stories[0]} />;
};

describe('<StoryEditTopBar>', () => {
	function renderComponent(
		contexts?: FakeStateProviderProps,
		history?: MemoryHistory
	) {
		return render(
			<Router history={history ?? createMemoryHistory()}>
				<FakeStateProvider {...contexts}>
					<TestStoryEditTopBar />
				</FakeStateProvider>
			</Router>
		);
	}

	it('displays a button to go back to the story list', () => {
		const history = createMemoryHistory({
			initialEntries: ['/stories/mock-story-id']
		});

		renderComponent({}, history);
		fireEvent.click(screen.getByText('routes.storyList.titleGeneric'));
		expect(history.location.pathname).toBe('/');
	});

	it('displays a button to create a passage', () => {
		renderComponent();
		expect(
			screen.getByText('routes.storyEdit.topBar.addPassage')
		).toBeInTheDocument();
	});

	it('displays zoom buttons', () => {
		renderComponent();
		expect(
			screen.getByText('routes.storyEdit.topBar.zoomIn')
		).toBeInTheDocument();
		expect(
			screen.getByText('routes.storyEdit.topBar.zoomOut')
		).toBeInTheDocument();
	});

	it('displays a button to play the story', () => {
		const openSpy = jest.spyOn(window, 'open');
		const story = fakeStory();

		openSpy.mockReturnValue(null);
		renderComponent({stories: [story]});
		expect(openSpy).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.play'));
		expect(openSpy.mock.calls).toEqual([
			[`#/stories/${story.id}/play`, '_blank']
		]);
	});

	it('displays a button to test the story', () => {
		const openSpy = jest.spyOn(window, 'open');
		const story = fakeStory();

		openSpy.mockReturnValue(null);
		renderComponent({stories: [story]});
		expect(openSpy).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.test'));
		expect(openSpy.mock.calls).toEqual([
			[`#/stories/${story.id}/test`, '_blank']
		]);
	});

	it('displays undo/redo buttons', () => {
		renderComponent();
		expect(screen.getByText('common.undo')).toBeInTheDocument();
		expect(screen.getByText('common.redo')).toBeInTheDocument();
	});

	it('displays a more menu', () => {
		renderComponent();
		expect(screen.getByText('common.more')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
