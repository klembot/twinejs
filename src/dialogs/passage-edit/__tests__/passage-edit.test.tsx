import {fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../store/stories';
import {
	fakeLoadedStoryFormat,
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	fakeUnloadedStoryFormat,
	StoryInspector
} from '../../../test-util';
import {PassageEditDialog, PassageEditDialogProps} from '../passage-edit';

jest.mock('../passage-toolbar');
jest.mock('../passage-text');
jest.mock('../story-format-toolbar');
jest.mock('../tag-toolbar');

const TestPassageEditDialog: React.FC<
	Partial<PassageEditDialogProps>
> = props => {
	const {stories} = useStoriesContext();

	return (
		<div data-testid="passage-edit-dialog">
			<PassageEditDialog
				collapsed={false}
				onChangeCollapsed={jest.fn()}
				onChangeHighlighted={jest.fn()}
				onChangeMaximized={jest.fn()}
				onClose={jest.fn()}
				passageId={stories[0].passages[0].id}
				storyId={stories[0].id}
				{...props}
			/>
		</div>
	);
};

describe('<PassageEditDialog>', () => {
	function renderComponent(
		context?: FakeStateProviderProps,
		props?: Partial<PassageEditDialogProps>
	) {
		const onClose = jest.fn();

		return {
			onClose,
			...render(
				<FakeStateProvider {...context}>
					<TestPassageEditDialog {...props} onClose={onClose} />
					<StoryInspector />
				</FakeStateProvider>
			)
		};
	}

	describe('when the passage exists in state', () => {
		describe('when no errors have occurred', () => {
			it('uses the passage name as dialog name', async () => {
				const story = fakeStory(1);
				const format = fakeUnloadedStoryFormat({
					name: story.storyFormat,
					version: story.storyFormatVersion
				});

				renderComponent({stories: [story], storyFormats: [format]});
				expect(screen.getByRole('heading')).toHaveTextContent(
					story.passages[0].name
				);
			});

			it('displays a passage text editor', async () => {
				const story = fakeStory(1);
				const format = fakeUnloadedStoryFormat({
					name: story.storyFormat,
					version: story.storyFormatVersion
				});

				renderComponent({stories: [story], storyFormats: [format]});
				expect(
					screen.getByTestId(`mock-passage-text-${story.passages[0].id}`)
				).toBeInTheDocument();
			});

			it('displays a dialog that can be maximized', () => {
				renderComponent();
				expect(screen.getByLabelText('common.maximize')).toBeInTheDocument();
			});

			it('updates the passage text when the user edits it', () => {
				const story = fakeStory(1);
				const format = fakeUnloadedStoryFormat({
					name: story.storyFormat,
					version: story.storyFormatVersion
				});

				renderComponent({stories: [story], storyFormats: [format]});
				fireEvent.click(
					within(
						screen.getByTestId(`mock-passage-text-${story.passages[0].id}`)
					).getByText('onChange')
				);
				expect(
					screen.getByTestId(`passage-${story.passages[0].id}`)
				).toHaveTextContent('mock-changed-text');
			});

			it('displays the format toolbar', () => {
				const story = fakeStory(1);
				const format = fakeLoadedStoryFormat({
					name: story.storyFormat,
					version: story.storyFormatVersion
				});

				renderComponent({stories: [story], storyFormats: [format]});
				expect(
					screen.getByTestId(`mock-story-format-toolbar-${format.id}`)
				).toBeInTheDocument();
			});

			it('displays the tag toolbar', () => {
				const story = fakeStory(1);
				const format = fakeLoadedStoryFormat({
					name: story.storyFormat,
					version: story.storyFormatVersion
				});

				renderComponent({stories: [story], storyFormats: [format]});
				expect(
					screen.getByTestId(`mock-tag-toolbar-${story.passages[0].id}`)
				).toBeInTheDocument();
			});

			it('does not disable story format extensions', () => {
				const story = fakeStory(1);
				const format = fakeLoadedStoryFormat({
					name: story.storyFormat,
					version: story.storyFormatVersion
				});

				renderComponent({stories: [story], storyFormats: [format]});
				expect(
					screen.getByTestId(`mock-passage-text-${story.passages[0].id}`)
						.dataset.storyFormatExtensionsDisabled
				).toBe('false');
			});

			it('is accessible', async () => {
				const {container} = renderComponent();

				expect(await axe(container)).toHaveNoViolations();
			});
		});

		describe('the first time an error occurs', () => {
			it('disables story format extensions in the editor', () => {
				jest.spyOn(console, 'error').mockReturnValue();

				const story = fakeStory(1);
				const format = fakeLoadedStoryFormat({
					name: story.storyFormat,
					version: story.storyFormatVersion
				});

				renderComponent({stories: [story], storyFormats: [format]});
				fireEvent.click(screen.getByText('throw error'));
				expect(
					screen.getByTestId(`mock-passage-text-${story.passages[0].id}`)
						.dataset.storyFormatExtensionsDisabled
				).toBe('true');
			});
		});

		describe('when an error occurs twice', () => {
			it('displays only an error message', () => {
				jest.spyOn(console, 'error').mockReturnValue();

				const story = fakeStory(1);
				const format = fakeLoadedStoryFormat({
					name: story.storyFormat,
					version: story.storyFormatVersion
				});

				renderComponent({stories: [story], storyFormats: [format]});
				fireEvent.click(screen.getByText('throw error'));
				fireEvent.click(screen.getByText('throw error'));
				expect(
					screen.getByText('dialogs.passageEdit.editorCrashed')
				).toBeInTheDocument();
				expect(
					screen.queryByTestId(`mock-passage-text-${story.passages[0].id}`)
				).not.toBeInTheDocument();
				expect(
					screen.queryByTestId(`mock-passage-toolbar-${story.passages[0].id}`)
				).not.toBeInTheDocument();
				expect(
					screen.queryByTestId(`mock-story-format-toolbar-${format.id}`)
				).not.toBeInTheDocument();
				expect(
					screen.queryByTestId(`mock-tag-toolbar-${story.passages[0].id}`)
				).not.toBeInTheDocument();
			});
		});
	});

	describe('when the passage does not exist in state', () => {
		it('renders nothing', () => {
			const story = fakeStory(1);

			renderComponent({stories: [story]}, {passageId: 'nonexistent'});
			expect(screen.getByTestId('passage-edit-dialog')).toHaveTextContent('');
		});

		it('calls the onClose prop', () => {
			const story = fakeStory(1);
			const {onClose} = renderComponent(
				{stories: [story]},
				{passageId: 'nonexistent'}
			);

			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});
});
