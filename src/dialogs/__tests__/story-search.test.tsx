import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../test-util';
import {StorySearchDialog} from '../story-search';

jest.mock('../../components/control/code-area/code-area');

const TestStorySearchDialog = () => {
	const [open, setOpen] = React.useState(true);
	const {stories} = useStoriesContext();

	return (
		<>
			<button onClick={() => setOpen(false)}>close</button>
			{open && (
				<StorySearchDialog
					collapsed={false}
					onChangeCollapsed={jest.fn()}
					onChangeHighlighted={jest.fn()}
					onChangeMaximized={jest.fn()}
					onClose={jest.fn()}
					storyId={stories[0].id}
				/>
			)}
		</>
	);
};

describe('<StorySearchDialog>', () => {
	function renderComponent(context?: Partial<FakeStateProviderProps>) {
		return render(
			<FakeStateProvider {...context}>
				<StoryInspector />
				<TestStorySearchDialog />
			</FakeStateProvider>
		);
	}

	// Needed because the dialog dispatches actions on unmount.
	afterEach(async () => await act(() => Promise.resolve()));

	it('removes highlighting from all passages when mounted', async () => {
		const story = fakeStory(3);

		story.passages[0].highlighted = true;
		story.passages[1].highlighted = true;
		story.passages[2].highlighted = true;
		renderComponent({stories: [story]});
		await waitFor(() =>
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset
					.highlighted
			).toBe('false')
		);
		expect(
			screen.getByTestId(`passage-${story.passages[1].id}`).dataset.highlighted
		).toBe('false');
		expect(
			screen.getByTestId(`passage-${story.passages[2].id}`).dataset.highlighted
		).toBe('false');
	});

	it('highlights matching passages when the search field changes', async () => {
		const story = fakeStory(3);

		story.passages[0].highlighted = false;
		story.passages[0].text = 'aaa';
		story.passages[1].highlighted = true;
		story.passages[1].text = 'bbb';
		story.passages[2].highlighted = false;
		story.passages[2].text = 'ccc';
		renderComponent({stories: [story]});
		fireEvent.change(screen.getByLabelText('dialogs.storySearch.find'), {
			target: {value: 'aaa'}
		});
		await waitFor(() =>
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset
					.highlighted
			).toBe('true')
		);
		expect(
			screen.getByTestId(`passage-${story.passages[1].id}`).dataset.highlighted
		).toBe('false');
		expect(
			screen.getByTestId(`passage-${story.passages[2].id}`).dataset.highlighted
		).toBe('false');
	});

	it('debounces highlighting matches', async () => {
		const story = fakeStory(1);

		story.passages[0].highlighted = false;
		story.passages[0].text = 'aaa';
		renderComponent({stories: [story]});
		fireEvent.change(screen.getByLabelText('dialogs.storySearch.find'), {
			target: {value: 'a'}
		});
		expect(
			screen.getByTestId(`passage-${story.passages[0].id}`).dataset.highlighted
		).toBe('false');
		await waitFor(() =>
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset
					.highlighted
			).toBe('true')
		);
	});

	it('incorporates the options chosen by the user when highlighting matches', async () => {
		const story = fakeStory();

		story.passages[0].highlighted = true;
		story.passages[0].name = 'aBC';
		story.passages[0].text = '';
		renderComponent({stories: [story]});
		fireEvent.click(
			screen.getByText('dialogs.storySearch.includePassageNames')
		);
		fireEvent.click(screen.getByText('dialogs.storySearch.matchCase'));
		fireEvent.click(screen.getByText('dialogs.storySearch.useRegexes'));
		fireEvent.change(screen.getByLabelText('dialogs.storySearch.find'), {
			target: {value: 'aB.'}
		});
		await waitFor(() =>
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset
					.highlighted
			).toBe('false')
		);
	});

	it('dispatches a highlight action to highlight no passages when closed', async () => {
		const story = fakeStory();

		story.passages[0].highlighted = true;
		renderComponent({stories: [story]});
		fireEvent.click(screen.getByText('close'));

		await waitFor(() =>
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset
					.highlighted
			).toBe('false')
		);
	});

	it('shows the number of matching passages for the search', () => {
		const story = fakeStory(1);

		story.passages[0].text = 'aaa';
		renderComponent({stories: [story]});
		fireEvent.change(screen.getByLabelText('dialogs.storySearch.find'), {
			target: {value: 'a'}
		});
		expect(
			screen.getByText('dialogs.storySearch.matchCount')
		).toBeInTheDocument();
		expect(
			screen.queryByText('dialogs.storySearch.noMatches')
		).not.toBeInTheDocument();
	});

	it('shows a message if no passages match the search', async () => {
		const story = fakeStory(1);

		story.passages[0].name = 'aaa';
		story.passages[0].text = 'bbb';
		renderComponent({stories: [story]});
		fireEvent.change(screen.getByLabelText('dialogs.storySearch.find'), {
			target: {value: 'e'}
		});
		await waitFor(() =>
			expect(
				screen.queryByText('dialogs.storySearch.noMatches')
			).toBeInTheDocument()
		);
		expect(
			screen.queryByText('dialogs.storySearch.matchCount')
		).not.toBeInTheDocument();
	});

	it('replaces text in passages when the replace button is clicked', async () => {
		const story = fakeStory(1);

		story.passages[0].text = 'mock-find';
		renderComponent({stories: [story]});
		fireEvent.click(
			screen.getByText('dialogs.storySearch.includePassageNames')
		);
		fireEvent.click(screen.getByText('dialogs.storySearch.matchCase'));
		fireEvent.click(screen.getByText('dialogs.storySearch.useRegexes'));
		fireEvent.change(screen.getByLabelText('dialogs.storySearch.find'), {
			target: {value: 'mock-find'}
		});
		fireEvent.change(screen.getByLabelText('dialogs.storySearch.replaceWith'), {
			target: {value: 'mock-replace'}
		});

		const replaceButton = screen.getByText('dialogs.storySearch.replaceAll');

		expect(replaceButton).not.toBeDisabled();
		fireEvent.click(replaceButton);
		expect(
			screen.getByTestId(`passage-${story.passages[0].id}`)
		).toHaveTextContent('mock-replace');
	});

	it('disables the replace button if there are no matches for the search', () => {
		const story = fakeStory(1);

		story.passages[0].text = 'aaa';
		renderComponent({stories: [story]});
		fireEvent.change(screen.getByLabelText('dialogs.storySearch.find'), {
			target: {value: 'mock-find'}
		});
		fireEvent.change(screen.getByLabelText('dialogs.storySearch.replaceWith'), {
			target: {value: 'mock-replace'}
		});
		expect(screen.getByText('dialogs.storySearch.replaceAll')).toBeDisabled();
	});

	it('disables the replace button if the search is empty', () => {
		renderComponent();
		fireEvent.change(screen.getByLabelText('dialogs.storySearch.find'), {
			target: {value: ''}
		});
		fireEvent.change(screen.getByLabelText('dialogs.storySearch.replaceWith'), {
			target: {value: 'mock-replace'}
		});
		expect(screen.getByText('dialogs.storySearch.replaceAll')).toBeDisabled();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
