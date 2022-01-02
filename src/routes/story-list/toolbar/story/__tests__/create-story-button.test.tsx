import {fireEvent, render, screen} from '@testing-library/react';
import {createMemoryHistory, MemoryHistory} from 'history';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Router} from 'react-router-dom';
import {
	fakePrefs,
	FakeStateProvider,
	FakeStateProviderProps,
	StoryInspector
} from '../../../../../test-util';
import {CreateStoryButton} from '../create-story-button';

describe('<CreateStoryButton>', () => {
	function renderComponent(
		contexts?: FakeStateProviderProps,
		history?: MemoryHistory
	) {
		return render(
			<Router history={history ?? createMemoryHistory()}>
				<FakeStateProvider {...contexts}>
					<CreateStoryButton />
					<StoryInspector />
				</FakeStateProvider>
			</Router>
		);
	}

	it("displays a button that creates an untitled story when clicked, then navigates to that story's edit route", () => {
		const history = createMemoryHistory();
		const prefs = fakePrefs();

		renderComponent({prefs, stories: []}, history);
		fireEvent.click(screen.getByRole('button', {name: 'common.new'}));

		const story = screen.getByTestId('story-inspector-default');

		expect(story).toBeInTheDocument();
		expect(story.dataset.name).toBe('store.storyDefaults.name');
		expect(story.dataset.storyFormat).toBe(prefs.storyFormat.name);
		expect(story.dataset.storyFormatVersion).toBe(prefs.storyFormat.version);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
