import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {renamePassageTag} from '../../store/stories/action-creators/rename-passage-tag';
import {setTagColor} from '../../store/stories/action-creators/tag-color';
import {
	UndoableStoriesContext,
	UndoableStoriesContextProps
} from '../../store/undoable-stories';
import {fakeStory} from '../../test-util';
import {PassageTagsDialog, PassageTagsDialogProps} from '../passage-tags';

jest.mock('../../components/tag/tag-editor');
jest.mock('../../store/stories/action-creators/rename-passage-tag');
jest.mock('../../store/stories/action-creators/tag-color');

describe('<PassageTagsDialog>', () => {
	const renamePassageTagMock = renamePassageTag as jest.Mock;
	const setTagColorMock = setTagColor as jest.Mock;

	async function renderComponent(
		props?: Partial<PassageTagsDialogProps>,
		storiesContext?: Partial<UndoableStoriesContextProps>
	) {
		const story = fakeStory(1);

		story.passages[0].tags = ['mock-tag'];

		const result = render(
			<UndoableStoriesContext.Provider
				value={{dispatch: jest.fn(), stories: [story], ...storiesContext}}
			>
				<PassageTagsDialog
					collapsed={false}
					onChangeCollapsed={jest.fn()}
					onChangeHighlighted={jest.fn()}
					onChangeMaximized={jest.fn()}
					onClose={jest.fn()}
					storyId={story.id}
					{...props}
				/>
			</UndoableStoriesContext.Provider>
		);

		// Need this because of <PromptButton>
		await act(async () => Promise.resolve());
		return result;
	}

	it('shows a tag editor for every passage tag', async () => {
		const story = fakeStory(2);

		story.passages[0].tags = ['mock-tag', 'mock-tag2'];
		story.passages[1].tags = ['mock-tag'];
		await renderComponent({storyId: story.id}, {stories: [story]});
		expect(screen.getByTestId('mock-tag-editor-mock-tag')).toBeInTheDocument();
		expect(screen.getByTestId('mock-tag-editor-mock-tag2')).toBeInTheDocument();
	});

	it('dispatches a story action if a tag is renamed', async () => {
		const dispatch = jest.fn();
		const story = fakeStory(1);
		const stories = [story];

		story.passages[0].tags = ['mock-tag'];
		renamePassageTagMock.mockImplementation((...args) => [...args]);
		await renderComponent({storyId: story.id}, {dispatch, stories});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(
			within(screen.getByTestId('mock-tag-editor-mock-tag')).getByText(
				'onChangeName'
			)
		);
		expect(renamePassageTagMock).toBeCalledTimes(1);
		expect(dispatch.mock.calls).toEqual([
			[renamePassageTagMock.mock.calls[0], 'undoChange.renameTag']
		]);
	});

	it('dispatches a story action if a tag color is changed', async () => {
		const dispatch = jest.fn();

		setTagColorMock.mockImplementation((...args) => [...args]);
		await renderComponent({}, {dispatch});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(
			within(screen.getByTestId('mock-tag-editor-mock-tag')).getByText(
				'onChangeColor'
			)
		);
		expect(setTagColorMock).toBeCalledTimes(1);
		expect(dispatch.mock.calls).toEqual([
			[setTagColorMock.mock.calls[0], 'undoChange.changeTagColor']
		]);
	});

	it('shows a message if there are no passage tags', async () => {
		const story = fakeStory(1);

		story.passages[0].tags = [];
		await renderComponent({storyId: story.id}, {stories: [story]});
		expect(screen.getByText('dialogs.passageTags.noTags')).toBeInTheDocument();
	});

	it('does not show a message if there are passage tags', async () => {
		const story = fakeStory(1);

		story.passages[0].tags = ['mock-tag'];
		await renderComponent({storyId: story.id}, {stories: [story]});
		expect(
			screen.queryByText('dialogs.storyTags.noTags')
		).not.toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
