import {fireEvent, render, screen} from '@testing-library/react';
import {createMemoryHistory, MemoryHistory} from 'history';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Router} from 'react-router-dom';
import {useStoryLaunch} from '../../../store/use-story-launch';
import {
	fakePrefs,
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	PrefInspector,
	StoryInspector
} from '../../../test-util';
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
		contexts?: FakeStateProviderProps,
		history?: MemoryHistory
	) {
		const result = render(
			<Router history={history ?? createMemoryHistory()}>
				<FakeStateProvider {...contexts}>
					<StoryCards
						onSelectStory={jest.fn()}
						stories={[fakeStory()]}
						{...props}
					/>
					<StoryInspector />
					<PrefInspector name="storyTagColors" />
				</FakeStateProvider>
			</Router>
		);

		return result;
	}

	it('renders a card for every story in props', async () => {
		const stories = [fakeStory(), fakeStory()];

		await renderComponent({stories});
		expect(
			screen.getByTestId(`mock-story-card-${stories[0].id}`)
		).toBeInTheDocument();
		expect(
			screen.getByTestId(`mock-story-card-${stories[1].id}`)
		).toBeInTheDocument();
	});

	it("changes a tag color it's changed in a card", async () => {
		renderComponent(
			{},
			{
				prefs: fakePrefs({storyTagColors: {'mock-existing-tag': 'red'}})
			}
		);
		expect(
			JSON.parse(
				screen.getByTestId('pref-inspector-storyTagColors').textContent!
			)
		).toEqual({
			'mock-existing-tag': 'red'
		});
		fireEvent.click(screen.getByText('onChangeTagColor'));
		expect(
			JSON.parse(
				screen.getByTestId('pref-inspector-storyTagColors').textContent!
			)
		).toEqual({
			'mock-existing-tag': 'red',
			'mock-tag': 'mock-tag-color'
		});
	});

	it('removes a story tag when it is removed in a card', async () => {
		const stories = [fakeStory()];

		stories[0].tags = ['mock-tag', 'mock-tag-2'];
		renderComponent({stories}, {stories});
		expect(screen.getByTestId('story-inspector-default').dataset.tags).toBe(
			'mock-tag mock-tag-2'
		);
		fireEvent.click(screen.getByText('onRemoveTag'));
		expect(screen.getByTestId('story-inspector-default').dataset.tags).toBe(
			'mock-tag-2'
		);
	});

	it('navigates to /stories/:id when a story is edited', async () => {
		const history = createMemoryHistory();
		const stories = [fakeStory()];

		await renderComponent({stories}, {}, history);
		fireEvent.click(screen.getByText('onEdit'));
		expect(history.location.pathname).toBe(`/stories/${stories[0].id}`);
	});

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
