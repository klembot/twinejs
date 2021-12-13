import {fireEvent, render, screen} from '@testing-library/react';
import {createMemoryHistory, MemoryHistory} from 'history';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Router} from 'react-router-dom';
import {DialogsContextProps} from '../../../../dialogs';
import {FakeStateProvider} from '../../../../test-util';
import {StoryListTopBar, StoryListTopBarProps} from '../top-bar';

jest.mock('../../../../components/control/menu-button');
jest.mock('../archive-button');
jest.mock('../create-story-button');
jest.mock('../sort-by-button');
jest.mock('../tag-filter-button');

describe('<StoryListTopBar>', () => {
	function renderComponent(
		props?: Partial<StoryListTopBarProps>,
		dialogsContext?: Partial<DialogsContextProps>,
		history?: MemoryHistory
	) {
		return render(
			<Router history={history ?? createMemoryHistory()}>
				<FakeStateProvider>
					<StoryListTopBar stories={[]} {...props} />
				</FakeStateProvider>
			</Router>
		);
	}

	it('displays a <CreateStoryButton />', () => {
		renderComponent();
		expect(screen.getByTestId('mock-create-story-button')).toBeInTheDocument();
	});

	it('displays a <SortByButton />', () => {
		renderComponent();
		expect(screen.getByTestId('mock-sort-by-button')).toBeInTheDocument();
	});

	it('displays a <TagFilterButton />', () => {
		renderComponent();
		expect(screen.getByTestId('mock-tag-filter-button')).toBeInTheDocument();
	});

	it('displays a <ArchiveButton />', () => {
		renderComponent();
		expect(screen.getByTestId('mock-archive-button')).toBeInTheDocument();
	});

	it('displays a button to go to the import route', () => {
		const history = createMemoryHistory();

		renderComponent({}, {}, history);
		fireEvent.click(screen.getByText('common.import'));
		expect(history.location.pathname).toBe('/import/stories');
	});

	it('displays a button to go to the story format route', () => {
		const history = createMemoryHistory();

		renderComponent({}, {}, history);
		fireEvent.click(screen.getByText('routes.storyList.topBar.storyFormats'));
		expect(history.location.pathname).toBe('/story-formats');
	});

	it('displays a button to view help', () => {
		renderComponent();
		expect(
			screen.getByRole('link', {name: 'routes.storyList.topBar.help'})
		).toHaveAttribute('href', 'https://twinery.org/2guide');
	});

	it('displays a button to open a story tags dialog', () => {
		renderComponent();
		fireEvent.click(screen.getByText('routes.storyList.topBar.storyTags'));
		expect(screen.getByText('dialogs.storyTags.title')).toBeInTheDocument();
	});

	it('displays a button to open an app prefs dialog', () => {
		renderComponent();
		fireEvent.click(screen.getByText('common.preferences'));
		expect(screen.getByText('dialogs.appPrefs.title')).toBeInTheDocument();
	});

	it('displays a button to open an about dialog', () => {
		renderComponent();
		fireEvent.click(screen.getByText('routes.storyList.topBar.about'));
		expect(screen.getByText('dialogs.aboutTwine.title')).toBeInTheDocument();
	});

	it('displays a button to report a bug', () => {
		const windowOpen = jest.spyOn(window, 'open').mockReturnValue();

		renderComponent();
		fireEvent.click(screen.getByText('routes.storyList.topBar.reportBug'));
		expect(windowOpen.mock.calls).toEqual([
			['https://twinery.org/2bugs', '_blank']
		]);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
