import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within
} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	addPassageTag,
	removePassageTag,
	setTagColor,
	updatePassage,
	updateStory
} from '../../../store/stories/action-creators';
import {
	StoryFormatsContext,
	StoryFormatsContextProps
} from '../../../store/story-formats';
import {
	UndoableStoriesContext,
	UndoableStoriesContextProps
} from '../../../store/undoable-stories';
import {fakeLoadedStoryFormat, fakeStory} from '../../../test-util';
import {PassageEditDialog, PassageEditDialogProps} from '../passage-edit';

jest.mock('../passage-text');
jest.mock('../../../components/control/menu-button');
jest.mock('../../../components/passage/rename-passage-button');
jest.mock('../../../components/tag/add-tag-button');
jest.mock('../../../components/tag/tag-button');
jest.mock('../../../store/stories/action-creators');

describe('<PassageEditDialog>', () => {
	const addPassageTagMock = addPassageTag as jest.Mock;
	const removePassageTagMock = removePassageTag as jest.Mock;
	const setTagColorMock = setTagColor as jest.Mock;
	const updatePassageMock = updatePassage as jest.Mock;
	const updateStoryMock = updateStory as jest.Mock;

	async function renderComponent(
		props?: Partial<PassageEditDialogProps>,
		storiesContext?: Partial<UndoableStoriesContextProps>,
		formatsContext?: Partial<StoryFormatsContextProps>
	) {
		const story = fakeStory(1);
		const format = fakeLoadedStoryFormat({
			name: story.storyFormat,
			version: story.storyFormatVersion
		});
		const result = render(
			<StoryFormatsContext.Provider
				value={{dispatch: jest.fn(), formats: [format], ...formatsContext}}
			>
				<UndoableStoriesContext.Provider
					value={{dispatch: jest.fn(), stories: [story], ...storiesContext}}
				>
					<PassageEditDialog
						collapsed={false}
						onChangeCollapsed={jest.fn()}
						onClose={jest.fn()}
						passageId={story.passages[0].id}
						storyId={story.id}
						{...props}
					/>
				</UndoableStoriesContext.Provider>
			</StoryFormatsContext.Provider>
		);

		// Need this because of <PromptButton>
		await act(async () => Promise.resolve());
		return result;
	}

	beforeEach(() => {
		addPassageTagMock.mockImplementation((...args) => [...args]);
		removePassageTagMock.mockImplementation((...args) => [...args]);
		setTagColorMock.mockImplementation((...args) => [...args]);
		updatePassageMock.mockImplementation((...args) => [...args]);
		updateStoryMock.mockImplementation((...args) => [...args]);
	});

	describe('when the passage exists in state', () => {
		it('uses the passage name as dialog name', async () => {
			const story = fakeStory(1);
			const format = fakeLoadedStoryFormat({
				name: story.storyFormat,
				version: story.storyFormatVersion
			});

			await renderComponent(
				{storyId: story.id, passageId: story.passages[0].id},
				{stories: [story]},
				{formats: [format]}
			);
			expect(screen.getByRole('heading')).toHaveTextContent(
				story.passages[0].name
			);
		});

		it('displays a passage text editor', async () => {
			const story = fakeStory(1);
			const format = fakeLoadedStoryFormat({
				name: story.storyFormat,
				version: story.storyFormatVersion
			});

			await renderComponent(
				{storyId: story.id, passageId: story.passages[0].id},
				{stories: [story]},
				{formats: [format]}
			);
			expect(
				screen.getByTestId(`mock-passage-text-${story.passages[0].id}`)
			).toBeInTheDocument();
		});

		it('dispatches an update action when the passage text is changed', async () => {
			const dispatch = jest.fn();
			const story = fakeStory(1);
			const format = fakeLoadedStoryFormat({
				name: story.storyFormat,
				version: story.storyFormatVersion
			});

			await renderComponent(
				{storyId: story.id, passageId: story.passages[0].id},
				{dispatch, stories: [story]},
				{formats: [format]}
			);
			expect(dispatch).not.toHaveBeenCalled();
			expect(updatePassageMock).not.toHaveBeenCalled();
			fireEvent.click(
				within(
					screen.getByTestId(`mock-passage-text-${story.passages[0].id}`)
				).getByText('onChange')
			);
			expect(updatePassageMock.mock.calls).toEqual([
				[story, story.passages[0], {text: 'mock-changed-text'}]
			]);
			expect(dispatch.mock.calls).toEqual([[updatePassageMock.mock.calls[0]]]);
		});

		it('displays passage tags', async () => {
			const story = fakeStory(1);
			const format = fakeLoadedStoryFormat({
				name: story.storyFormat,
				version: story.storyFormatVersion
			});

			story.passages[0].tags = ['mock-tag', 'mock-tag2'];
			await renderComponent(
				{storyId: story.id, passageId: story.passages[0].id},
				{stories: [story]},
				{formats: [format]}
			);
			expect(
				screen.getByTestId('mock-tag-button-mock-tag')
			).toBeInTheDocument();
			expect(
				screen.getByTestId('mock-tag-button-mock-tag2')
			).toBeInTheDocument();
		});

		it('dispatches an update action when a tag color is changed', async () => {
			const dispatch = jest.fn();
			const story = fakeStory(1);
			const format = fakeLoadedStoryFormat({
				name: story.storyFormat,
				version: story.storyFormatVersion
			});

			story.passages[0].tags = ['mock-tag'];
			await renderComponent(
				{storyId: story.id, passageId: story.passages[0].id},
				{dispatch, stories: [story]},
				{formats: [format]}
			);
			expect(dispatch).not.toHaveBeenCalled();
			expect(updateStoryMock).not.toHaveBeenCalled();
			fireEvent.click(
				within(screen.getByTestId('mock-tag-button-mock-tag')).getByText(
					'onChangeColor'
				)
			);
			expect(updateStoryMock.mock.calls).toEqual([
				[
					[story],
					story,
					{tagColors: {'mock-tag': 'mock-color', ...story.tagColors}}
				]
			]);
		});

		it('dispatches an update action when a tag is removed', async () => {
			const dispatch = jest.fn();
			const story = fakeStory(1);
			const format = fakeLoadedStoryFormat({
				name: story.storyFormat,
				version: story.storyFormatVersion
			});

			story.passages[0].tags = ['mock-tag'];
			await renderComponent(
				{storyId: story.id, passageId: story.passages[0].id},
				{dispatch, stories: [story]},
				{formats: [format]}
			);
			expect(dispatch).not.toHaveBeenCalled();
			expect(removePassageTagMock).not.toHaveBeenCalled();
			fireEvent.click(
				within(screen.getByTestId('mock-tag-button-mock-tag')).getByText(
					'onRemove'
				)
			);
			expect(removePassageTagMock.mock.calls).toEqual([
				[story, story.passages[0], 'mock-tag']
			]);
		});

		it('displays a button to add tags to the passage', async () => {
			await renderComponent();
			expect(screen.getByTestId('mock-add-tag-button')).toBeInTheDocument();
		});

		it('dispatches actions when a tag is added', async () => {
			const dispatch = jest.fn();
			const story = fakeStory(1);
			const format = fakeLoadedStoryFormat({
				name: story.storyFormat,
				version: story.storyFormatVersion
			});

			await renderComponent(
				{storyId: story.id, passageId: story.passages[0].id},
				{dispatch, stories: [story]},
				{formats: [format]}
			);
			expect(dispatch).not.toHaveBeenCalled();
			expect(addPassageTagMock).not.toHaveBeenCalled();
			expect(setTagColorMock).not.toHaveBeenCalled();
			fireEvent.click(
				within(screen.getByTestId('mock-add-tag-button')).getByText('onAdd')
			);
			expect(addPassageTagMock.mock.calls).toEqual([
				[story, story.passages[0], 'mock-tag-name']
			]);
			expect(setTagColorMock.mock.calls).toEqual([
				[story, 'mock-tag-name', 'mock-color']
			]);
			expect(dispatch.mock.calls).toEqual([
				[addPassageTagMock.mock.calls[0]],
				[setTagColorMock.mock.calls[0]]
			]);
		});

		it('displays a button to rename the passage', async () => {
			const story = fakeStory(1);
			const format = fakeLoadedStoryFormat({
				name: story.storyFormat,
				version: story.storyFormatVersion
			});

			await renderComponent(
				{storyId: story.id, passageId: story.passages[0].id},
				{stories: [story]},
				{formats: [format]}
			);
			expect(
				screen.getByText(`mock-rename-passage-button-${story.passages[0].id}`)
			).toBeInTheDocument();
		});

		it('dispatches an update action when the passage is renamed', async () => {
			const dispatch = jest.fn();
			const story = fakeStory(1);
			const format = fakeLoadedStoryFormat({
				name: story.storyFormat,
				version: story.storyFormatVersion
			});

			await renderComponent(
				{storyId: story.id, passageId: story.passages[0].id},
				{dispatch, stories: [story]},
				{formats: [format]}
			);
			expect(dispatch).not.toHaveBeenCalled();
			expect(updatePassageMock).not.toHaveBeenCalled();
			fireEvent.click(
				screen.getByText(`mock-rename-passage-button-${story.passages[0].id}`)
			);
			expect(updatePassageMock.mock.calls).toEqual([
				[
					story,
					story.passages[0],
					{name: 'mock-new-passage-name'},
					{dontCreateNewlyLinkedPassages: true}
				]
			]);
			expect(dispatch.mock.calls).toEqual([[updatePassageMock.mock.calls[0]]]);
		});

		it('displays a checkbox button showing whether the passage is the start passage', async () => {
			const story = fakeStory(2);
			const format = fakeLoadedStoryFormat({
				name: story.storyFormat,
				version: story.storyFormatVersion
			});

			story.startPassage = story.passages[0].id;
			await renderComponent(
				{storyId: story.id, passageId: story.passages[0].id},
				{stories: [story]},
				{formats: [format]}
			);

			let startCheckbox = screen.getByRole('checkbox', {
				name: 'dialogs.passageEdit.setAsStart'
			});

			expect(startCheckbox).toBeChecked();

			// See https://github.com/testing-library/jest-dom/issues/144
			expect(startCheckbox).toHaveAttribute('aria-disabled', 'true');
			cleanup();
			story.startPassage = story.passages[1].id;
			await renderComponent(
				{storyId: story.id, passageId: story.passages[0].id},
				{stories: [story]},
				{formats: [format]}
			);
			startCheckbox = screen.getByRole('checkbox', {
				name: 'dialogs.passageEdit.setAsStart'
			});
			expect(startCheckbox).not.toBeChecked();
			expect(startCheckbox).not.toHaveAttribute('aria-disabled', 'true');
		});

		it('dispatches an update action when the passage is selected as the start one', async () => {
			const dispatch = jest.fn();
			const story = fakeStory(2);
			const format = fakeLoadedStoryFormat({
				name: story.storyFormat,
				version: story.storyFormatVersion
			});

			story.startPassage = story.passages[1].id;
			await renderComponent(
				{storyId: story.id, passageId: story.passages[0].id},
				{dispatch, stories: [story]},
				{formats: [format]}
			);
			expect(dispatch).not.toHaveBeenCalled();
			expect(updateStoryMock).not.toHaveBeenCalled();
			fireEvent.click(screen.getByText('dialogs.passageEdit.setAsStart'));
			expect(updateStoryMock.mock.calls).toEqual([
				[[story], story, {startPassage: story.passages[0].id}]
			]);
		});

		// Need a higher-fidelity mock of <MenuButton> that includes checked state.

		it.todo(
			"displays a dropdown menu of sizes, with the passage's current one selected"
		);

		it.each([
			['small', 'Small', {height: 100, width: 100}],
			['large', 'Large', {height: 200, width: 200}],
			['tall', 'Tall', {height: 200, width: 100}],
			['wide', 'Wide', {height: 100, width: 200}]
		])(
			"dispatches an action when the passage's size is changed to %s",
			async (_, label, passageProps) => {
				const dispatch = jest.fn();
				const story = fakeStory(2);
				const format = fakeLoadedStoryFormat({
					name: story.storyFormat,
					version: story.storyFormatVersion
				});

				await renderComponent(
					{storyId: story.id, passageId: story.passages[0].id},
					{dispatch, stories: [story]},
					{formats: [format]}
				);
				expect(dispatch).not.toHaveBeenCalled();
				expect(updatePassageMock).not.toHaveBeenCalled();
				fireEvent.click(screen.getByText(`dialogs.passageEdit.size${label}`));
				expect(updatePassageMock.mock.calls).toEqual([
					[story, story.passages[0], passageProps]
				]);
				expect(dispatch.mock.calls).toEqual([
					[updatePassageMock.mock.calls[0]]
				]);
			}
		);

		// it("dispatches an action when the passage's size is changed", async () => {
		// 	const dispatch = jest.fn();
		// 	const story = fakeStory(2);
		// 	const format = fakeLoadedStoryFormat({
		// 		name: story.storyFormat,
		// 		version: story.storyFormatVersion
		// 	});

		// 	await renderComponent(
		// 		{storyId: story.id, passageId: story.passages[0].id},
		// 		{dispatch, stories: [story]},
		// 		{formats: [format]}
		// 	);
		// 	expect(dispatch).not.toHaveBeenCalled();
		// 	expect(updatePassageMock).not.toHaveBeenCalled();
		// 	fireEvent.click(screen.getByText('dialogs.passageEdit.sizeLarge'));
		// 	expect(updatePassageMock.mock.calls).toEqual([
		// 		[story, story.passages[0], {height: 200, width: 200}]
		// 	]);
		// 	expect(dispatch.mock.calls).toEqual([[updatePassageMock.mock.calls[0]]]);
		// });

		it('is accessible', async () => {
			const {container} = await renderComponent();

			expect(await axe(container)).toHaveNoViolations();
		});
	});

	describe('when the passage does not exist in state', () => {
		it('renders nothing', async () => {
			await renderComponent({passageId: 'nonexistent'});
			expect(document.body.textContent).toBe('');
		});

		it('calls the onClose prop', async () => {
			const onClose = jest.fn();

			await renderComponent({onClose, passageId: 'nonexistent'});
			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});
});
