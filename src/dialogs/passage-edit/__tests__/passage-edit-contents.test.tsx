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
import {
	PassageEditContents,
	PassageEditContentsProps
} from '../passage-edit-contents';

jest.mock('../passage-toolbar');
jest.mock('../passage-text');
jest.mock('../story-format-toolbar');

const TestPassageEditContents: React.FC<
	Partial<PassageEditContentsProps>
> = props => {
	const {stories} = useStoriesContext();

	return (
		<div data-testid="passage-edit-contents">
			<PassageEditContents
				passageId={stories[0].passages[0].id}
				storyId={stories[0].id}
				{...props}
			/>
		</div>
	);
};

describe('<PassageEditContents>', () => {
	function renderComponent(
		context?: FakeStateProviderProps,
		props?: Partial<PassageEditContentsProps>
	) {
		return render(
			<FakeStateProvider {...context}>
				<TestPassageEditContents {...props} />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	describe('when the passage exists in state', () => {
		describe('when no errors have occurred', () => {
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

			it('displays the format toolbar when CodeMirror is enabled', () => {
				const story = fakeStory(1);
				const format = fakeLoadedStoryFormat({
					name: story.storyFormat,
					version: story.storyFormatVersion
				});

				renderComponent({
					prefs: {useCodeMirror: true},
					stories: [story],
					storyFormats: [format]
				});
				expect(
					screen.getByTestId(`mock-story-format-toolbar-${format.id}`)
				).toBeInTheDocument();
			});

			it("doesn't display the format toolbar when CodeMirror is enabled", () => {
				const story = fakeStory(1);
				const format = fakeLoadedStoryFormat({
					name: story.storyFormat,
					version: story.storyFormatVersion
				});

				renderComponent({
					prefs: {useCodeMirror: false},
					stories: [story],
					storyFormats: [format]
				});
				expect(
					screen.queryByTestId(`mock-story-format-toolbar-${format.id}`)
				).not.toBeInTheDocument();
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
			});
		});
	});

	describe('when the passage does not exist in state', () => {
		it('throws an error', () => {
			const errorSpy = jest.spyOn(console, 'error').mockReturnValue();

			const story = fakeStory(1);

			expect(() =>
				renderComponent({stories: [story]}, {passageId: 'nonexistent'})
			).toThrow();
			errorSpy.mockReset();
		});
	});
});
