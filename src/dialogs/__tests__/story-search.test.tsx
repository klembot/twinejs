import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor
} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {replaceInStory} from '../../store/stories/action-creators/find-replace';
import {highlightPassagesMatchingSearch} from '../../store/stories/action-creators/highlight-passages';
import {
	UndoableStoriesContext,
	UndoableStoriesContextProps
} from '../../store/undoable-stories';
import {fakeStory} from '../../test-util';
import {StorySearchDialog, StorySearchDialogProps} from '../story-search';

jest.mock('../../components/control/code-area/code-area');
jest.mock('../../store/stories/action-creators/find-replace');
jest.mock('../../store/stories/action-creators/highlight-passages');

describe('<StorySearchDialog>', () => {
	const highlightPassagesMock = highlightPassagesMatchingSearch as jest.Mock;
	const replaceInStoryMock = replaceInStory as jest.Mock;

	function renderComponent(
		props?: Partial<StorySearchDialogProps>,
		context?: Partial<UndoableStoriesContextProps>
	) {
		const story = fakeStory();

		return render(
			<UndoableStoriesContext.Provider
				value={{dispatch: jest.fn(), stories: [story], ...context}}
			>
				<StorySearchDialog
					collapsed={false}
					onChangeCollapsed={jest.fn()}
					onClose={jest.fn()}
					storyId={story.id}
					{...props}
				/>
			</UndoableStoriesContext.Provider>
		);
	}

	it('dispatches a highlight action to highlight no passages when mounted', () => {
		const dispatch = jest.fn();
		const story = fakeStory();

		highlightPassagesMock.mockImplementation((...args) => [...args]);
		renderComponent({storyId: story.id}, {dispatch, stories: [story]});
		expect(highlightPassagesMock.mock.calls).toEqual([
			[
				story,
				'',
				{includePassageNames: true, matchCase: false, useRegexes: false}
			]
		]);
		expect(dispatch.mock.calls).toEqual([
			[highlightPassagesMock.mock.calls[0]]
		]);
	});

	it('dispatches a highlight action to highlight passages when the search field changes', () => {
		const dispatch = jest.fn();
		const story = fakeStory();

		highlightPassagesMock.mockImplementation((...args) => [...args]);
		renderComponent({storyId: story.id}, {dispatch, stories: [story]});
		highlightPassagesMock.mockClear();
		dispatch.mockClear();
		fireEvent.change(screen.getByLabelText('dialogs.storySearch.find'), {
			target: {value: 'mock-value'}
		});

		// Even clearing the mock, dispatch is getting called twice--I think because
		// the effect cleanup is firing.

		expect(highlightPassagesMock).toBeCalledTimes(2);
		expect(highlightPassagesMock.mock.calls[1]).toEqual([
			story,
			'mock-value',
			{includePassageNames: true, matchCase: false, useRegexes: false}
		]);
		expect(dispatch).toBeCalledTimes(2);
		expect(dispatch.mock.calls[1]).toEqual([
			highlightPassagesMock.mock.calls[1]
		]);
	});

	it('incorporates the options chosen by the user when highlighting matches', () => {
		const dispatch = jest.fn();
		const story = fakeStory();

		highlightPassagesMock.mockImplementation((...args) => [...args]);
		renderComponent({storyId: story.id}, {dispatch, stories: [story]});
		fireEvent.click(
			screen.getByText('dialogs.storySearch.includePassageNames')
		);
		fireEvent.click(screen.getByText('dialogs.storySearch.matchCase'));
		fireEvent.click(screen.getByText('dialogs.storySearch.useRegexes'));
		highlightPassagesMock.mockClear();
		dispatch.mockClear();
		fireEvent.change(screen.getByLabelText('dialogs.storySearch.find'), {
			target: {value: 'mock-value'}
		});

		// See note above about the multiple calls.

		expect(highlightPassagesMock).toBeCalledTimes(2);
		expect(highlightPassagesMock.mock.calls[1]).toEqual([
			story,
			'mock-value',
			{includePassageNames: false, matchCase: true, useRegexes: true}
		]);
		expect(dispatch).toBeCalledTimes(2);
		expect(dispatch.mock.calls[1]).toEqual([
			highlightPassagesMock.mock.calls[1]
		]);
	});

	it('dispatches a highlight action to highlight no passages when unmounted', () => {
		const dispatch = jest.fn();
		const story = fakeStory();

		highlightPassagesMock.mockImplementation((...args) => [...args]);
		renderComponent({storyId: story.id}, {dispatch, stories: [story]});
		highlightPassagesMock.mockClear();
		dispatch.mockClear();
		cleanup();
		expect(highlightPassagesMock.mock.calls).toEqual([[story, '', {}]]);
		expect(dispatch.mock.calls).toEqual([
			[highlightPassagesMock.mock.calls[0]]
		]);
	});

	it('shows the number of matching passages for the search', () => {
		const story = fakeStory(1);

		story.passages[0].text = 'aaa';
		renderComponent({storyId: story.id}, {stories: [story]});
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

	it.skip('shows a message if no passages match the search', async () => {
		const story = fakeStory(1);

		story.passages[0].text = 'aaa';
		renderComponent({storyId: story.id}, {stories: [story]});
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

	it('dispatches a story action when the replace button is clicked', async () => {
		const dispatch = jest.fn();
		const story = fakeStory(1);

		replaceInStoryMock.mockImplementation((...args) => [...args]);
		story.passages[0].text = 'mock-find';
		renderComponent({storyId: story.id}, {dispatch, stories: [story]});
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
		dispatch.mockClear();

		const replaceButton = screen.getByText('dialogs.storySearch.replaceAll');

		expect(replaceButton).not.toBeDisabled();
		expect(dispatch).not.toBeCalled();
		fireEvent.click(replaceButton);
		expect(replaceInStoryMock.mock.calls).toEqual([
			[
				story,
				'mock-find',
				'mock-replace',
				{includePassageNames: false, matchCase: true, useRegexes: true}
			]
		]);
		expect(dispatch.mock.calls).toEqual([
			[replaceInStoryMock.mock.calls[0], 'undoChange.replaceAllText']
		]);
	});

	it('disables the replace button if there are no matches for the search', () => {
		const story = fakeStory(1);

		story.passages[0].text = 'aaa';
		renderComponent({storyId: story.id}, {stories: [story]});
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
