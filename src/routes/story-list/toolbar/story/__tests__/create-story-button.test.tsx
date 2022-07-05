import {act, fireEvent, render, screen} from '@testing-library/react';
import {lorem} from 'faker';
import {createMemoryHistory, MemoryHistory} from 'history';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Router} from 'react-router-dom';
import {
	fakePrefs,
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../../../../test-util';
import {CreateStoryButton} from '../create-story-button';

describe('<CreateStoryButton>', () => {
	async function renderComponent(
		contexts?: FakeStateProviderProps,
		history?: MemoryHistory
	) {
		const result = render(
			<Router history={history ?? createMemoryHistory()}>
				<FakeStateProvider {...contexts}>
					<CreateStoryButton />
					<StoryInspector />
				</FakeStateProvider>
			</Router>
		);

		// Need this because of <PromptButton>
		await act(async () => Promise.resolve());
		fireEvent.click(screen.getByText('common.new'));
		await act(async () => Promise.resolve());
		return result;
	}

	it('creates a new story when a valid name is entered and the create button is clicked', async () => {
		const history = createMemoryHistory();
		const prefs = fakePrefs();
		const name = lorem.words(3);

		await renderComponent({prefs, stories: []}, history);
		fireEvent.change(
			screen.getByRole('textbox', {
				name: 'routes.storyList.toolbar.createStoryButton.prompt'
			}),
			{target: {value: name}}
		);
		fireEvent.click(screen.getByRole('button', {name: 'common.create'}));

		const story = screen.getByTestId('story-inspector-default');

		expect(story).toBeInTheDocument();
		expect(story.dataset.name).toBe(name);
		expect(story.dataset.storyFormat).toBe(prefs.storyFormat.name);
		expect(story.dataset.storyFormatVersion).toBe(prefs.storyFormat.version);
		expect(history.location.pathname).toBe(`/stories/${story.dataset.id}`);
		await act(() => Promise.resolve());
	});

	it('shows an error if no name is entered', async () => {
		const prefs = fakePrefs();

		await renderComponent({prefs, stories: []});
		fireEvent.change(
			screen.getByRole('textbox', {
				name: 'routes.storyList.toolbar.createStoryButton.prompt'
			}),
			{target: {value: '    '}}
		);
		await act(() => Promise.resolve());
		expect(
			screen.getByText('routes.storyList.toolbar.createStoryButton.emptyName')
		).toBeInTheDocument();
		expect(screen.getByRole('button', {name: 'common.create'})).toBeDisabled();
	});

	it('shows an error if the name entered is the same as a story that exists', async () => {
		const prefs = fakePrefs();
		const story = fakeStory();

		await renderComponent({prefs, stories: [story]});
		fireEvent.change(
			screen.getByRole('textbox', {
				name: 'routes.storyList.toolbar.createStoryButton.prompt'
			}),
			{target: {value: story.name}}
		);
		await act(() => Promise.resolve());
		expect(
			screen.getByText(
				'routes.storyList.toolbar.createStoryButton.nameConflict'
			)
		).toBeInTheDocument();
		expect(screen.getByRole('button', {name: 'common.create'})).toBeDisabled();
	});

	it('is accessible', async () => {
		const prefs = fakePrefs();
		const {container} = await renderComponent({prefs, stories: []});

		expect(await axe(container)).toHaveNoViolations();
	});
});
