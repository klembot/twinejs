import {fireEvent, render, screen} from '@testing-library/react';
import {createMemoryHistory, MemoryHistory} from 'history';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Router} from 'react-router-dom';
import {useStoryLaunch} from '../../../store/use-story-launch';
import {fakePrefs, fakeStory} from '../../../test-util';
import {
	MockContextProvider,
	MockContextProviderProps
} from '../../../test-util/MockContextProvider';
import {StoryCards, StoryCardsProps} from '../story-cards';

jest.mock('../../../components/story/story-card');
jest.mock('../../../store/use-story-launch');

describe('<StoryCards>', () => {
	const useStoryLaunchMock = useStoryLaunch as jest.Mock;
	let playStory: jest.Mock;
	let testStory: jest.Mock;

	beforeEach(() => {
		playStory = jest.fn();
		testStory = jest.fn();
		useStoryLaunchMock.mockReturnValue({playStory, testStory});
	});

	async function renderComponent(
		props?: Partial<StoryCardsProps>,
		contexts?: MockContextProviderProps,
		history?: MemoryHistory
	) {
		const result = render(
			<Router history={history ?? createMemoryHistory()}>
				<MockContextProvider {...contexts}>
					<StoryCards
						onPublish={jest.fn()}
						stories={[fakeStory()]}
						{...props}
					/>
				</MockContextProvider>
			</Router>
		);

		return result;
	}

	it('renders a card for every story', async () => {
		const stories = [fakeStory(), fakeStory()];

		await renderComponent({stories});
		expect(
			screen.getByTestId(`mock-story-card-${stories[0].id}`)
		).toBeInTheDocument();
		expect(
			screen.getByTestId(`mock-story-card-${stories[1].id}`)
		).toBeInTheDocument();
	});

	it('dispatches actions when a tag is added', async () => {
		const prefsDispatch = jest.fn();
		const stories = [fakeStory()];
		const storiesDispatch = jest.fn();

		renderComponent(
			{stories},
			{
				prefs: {
					dispatch: prefsDispatch,
					prefs: fakePrefs({storyTagColors: {'mock-existing-tag': 'red'}})
				},
				undoableStories: {stories, dispatch: storiesDispatch}
			}
		);
		expect(prefsDispatch).not.toHaveBeenCalled();
		expect(storiesDispatch).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('onAddTag'));
		expect(prefsDispatch.mock.calls).toEqual([
			[
				{
					type: 'update',
					name: 'storyTagColors',
					value: {'mock-existing-tag': 'red', 'mock-tag': 'mock-tag-color'}
				}
			]
		]);
		expect(storiesDispatch.mock.calls).toEqual([
			[
				{
					type: 'updateStory',
					storyId: stories[0].id,
					props: {tags: ['mock-tag']}
				}
			]
		]);
	});

	it('dispatches an action when a tag color is changed', async () => {
		const dispatch = jest.fn();

		renderComponent(
			{},
			{
				prefs: {
					dispatch,
					prefs: fakePrefs({storyTagColors: {'mock-existing-tag': 'red'}})
				}
			}
		);
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('onChangeTagColor'));
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'update',
					name: 'storyTagColors',
					value: {
						'mock-existing-tag': 'red',
						'mock-tag': 'mock-tag-color'
					}
				}
			]
		]);
	});

	it('dispatches an action when a story is deleted', async () => {
		const dispatch = jest.fn();
		const stories = [fakeStory()];

		renderComponent({stories}, {undoableStories: {dispatch, stories}});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('onDelete'));
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'deleteStory',
					storyId: stories[0].id
				}
			]
		]);
	});

	// Need to mock duplicateStory action creator
	it.todo('dispatches an action when a story is duplicated');

	it('navigates to /stories/:id when a story is edited', async () => {
		const history = createMemoryHistory();
		const stories = [fakeStory()];

		await renderComponent({stories}, {}, history);
		fireEvent.click(screen.getByText('onEdit'));
		expect(history.location.pathname).toBe(`/stories/${stories[0].id}`);
	});

	it('launches the story in play mode when it is played', async () => {
		const stories = [fakeStory()];

		await renderComponent({stories});
		expect(playStory).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('onPlay'));
		expect(playStory.mock.calls).toEqual([[stories[0].id]]);
	});

	it('calls the onPublish prop when a story is published', async () => {
		const stories = [fakeStory()];
		const onPublish = jest.fn();

		await renderComponent({onPublish, stories});
		expect(onPublish).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('onPublish'));
		expect(onPublish.mock.calls).toEqual([[stories[0]]]);
	});

	it('dispatches an action when a story tag is removed', async () => {
		const dispatch = jest.fn();
		const stories = [fakeStory()];

		stories[0].tags = ['mock-tag', 'mock-tag-2'];
		renderComponent({stories}, {undoableStories: {dispatch, stories}});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('onRemoveTag'));
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updateStory',
					storyId: stories[0].id,
					props: {
						tags: ['mock-tag-2']
					}
				}
			]
		]);
	});

	it('dispatches an action when a story is renamed', async () => {
		const dispatch = jest.fn();
		const stories = [fakeStory()];

		stories[0].tags = ['mock-tag', 'mock-tag-2'];
		renderComponent({stories}, {undoableStories: {dispatch, stories}});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('onRename'));
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updateStory',
					storyId: stories[0].id,
					props: {
						name: 'mock-name'
					}
				}
			]
		]);
	});

	it('launches the story in test mode when it is tested', async () => {
		const stories = [fakeStory()];

		await renderComponent({stories});
		expect(testStory).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('onTest'));
		expect(testStory.mock.calls).toEqual([[stories[0].id]]);
	});

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
