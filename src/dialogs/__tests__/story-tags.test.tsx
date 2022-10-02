import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {PrefsContext, PrefsContextProps} from '../../store/prefs';
import {renameStoryTag} from '../../store/stories';
import {
	UndoableStoriesContext,
	UndoableStoriesContextProps
} from '../../store/undoable-stories';
import {fakePrefs, fakeStory} from '../../test-util';
import {StoryTagsDialog, StoryTagsDialogProps} from '../story-tags';

jest.mock('../../components/tag/tag-editor');
jest.mock('../../store/stories/action-creators/rename-story-tag');

describe('<StoryTagsDialog>', () => {
	const renameStoryTagMock = renameStoryTag as jest.Mock;

	async function renderComponent(
		props?: Partial<StoryTagsDialogProps>,
		storiesContext?: Partial<UndoableStoriesContextProps>,
		prefsContext?: Partial<PrefsContextProps>
	) {
		const prefs = fakePrefs({storyTagColors: {'mock-tag': 'red'}});
		const story = fakeStory();

		story.tags = ['mock-tag'];

		const result = render(
			<PrefsContext.Provider
				value={{prefs, dispatch: jest.fn(), ...prefsContext}}
			>
				<UndoableStoriesContext.Provider
					value={{dispatch: jest.fn(), stories: [story], ...storiesContext}}
				>
					<StoryTagsDialog
						collapsed={false}
						onChangeCollapsed={jest.fn()}
						onChangeHighlighted={jest.fn()}
						onChangeMaximized={jest.fn()}
						onClose={jest.fn()}
						{...props}
					/>
				</UndoableStoriesContext.Provider>
			</PrefsContext.Provider>
		);

		// Need this because of <PromptButton>
		await act(async () => Promise.resolve());
		return result;
	}

	it('shows a tag editor for every story tag', async () => {
		const story = fakeStory();

		story.tags = ['mock-tag', 'mock-tag2'];
		await renderComponent(
			{},
			{stories: [story]},
			{prefs: fakePrefs({storyTagColors: {'mock-tag': 'red'}})}
		);

		expect(screen.getByTestId('mock-tag-editor-mock-tag')).toBeInTheDocument();
		expect(screen.getByTestId('mock-tag-editor-mock-tag2')).toBeInTheDocument();
	});

	it('dispatches a story action if a tag is renamed', async () => {
		const dispatch = jest.fn();
		const story = fakeStory();
		const stories = [story];

		story.tags = ['mock-tag'];
		renameStoryTagMock.mockImplementation((...args) => [...args]);
		await renderComponent({}, {dispatch, stories});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(
			within(screen.getByTestId('mock-tag-editor-mock-tag')).getByText(
				'onChangeName'
			)
		);
		expect(renameStoryTagMock).toBeCalledTimes(1);
		expect(dispatch.mock.calls).toEqual([[renameStoryTagMock.mock.calls[0]]]);
	});

	it('dispatches a pref action if a tag color is changed', async () => {
		const dispatch = jest.fn();

		await renderComponent({}, {}, {dispatch});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(
			within(screen.getByTestId('mock-tag-editor-mock-tag')).getByText(
				'onChangeColor'
			)
		);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'update',
					name: 'storyTagColors',
					value: {'mock-tag': 'mock-color'}
				}
			]
		]);
	});

	it('shows a message if there are no story tags', async () => {
		const story = fakeStory();

		story.tags = [];
		await renderComponent({}, {stories: [story]});
		expect(screen.getByText('dialogs.storyTags.noTags')).toBeInTheDocument();
	});

	it('does not show a message if there are story tags', async () => {
		const story = fakeStory();

		story.tags = ['mock-tag'];
		await renderComponent({}, {stories: [story]});
		expect(
			screen.queryByText('dialogs.storyTags.noTags')
		).not.toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
