import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../test-util';
import {StoryStylesheetDialog} from '../story-stylesheet';

jest.mock('../../components/control/code-area/code-area');

const TestStoryStylesheetDialog = () => {
	const {stories} = useStoriesContext();

	return (
		<StoryStylesheetDialog
			collapsed={false}
			onChangeCollapsed={jest.fn()}
			onChangeHighlighted={jest.fn()}
			onChangeMaximized={jest.fn()}
			onClose={jest.fn()}
			storyId={stories[0].id}
		/>
	);
};

describe('<StoryStylesheetDialog>', () => {
	function renderComponent(contexts?: FakeStateProviderProps) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestStoryStylesheetDialog />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	it('displays a dialog that can be maximized', () => {
		renderComponent();
		expect(screen.getByLabelText('common.maximize')).toBeInTheDocument();
	});

	it("displays the story's stylesheet", () => {
		const story = fakeStory();

		story.stylesheet = 'mock-story-stylesheet';
		renderComponent({stories: [story]});
		expect(
			screen.getByLabelText('dialogs.storyStylesheet.editorLabel')
		).toHaveValue('mock-story-stylesheet');
	});

	it("changes the story's stylesheet as edits are made", () => {
		renderComponent();
		fireEvent.change(
			screen.getByLabelText('dialogs.storyStylesheet.editorLabel'),
			{
				target: {value: 'mock-change'}
			}
		);
		expect(
			screen.getByTestId('story-inspector-stylesheet-default')
		).toHaveTextContent('mock-change');
	});

	it('uses the code editor font preferences', () => {
		renderComponent({
			prefs: {
				codeEditorFontFamily: 'mock-font-family',
				codeEditorFontScale: 2,
				passageEditorFontFamily: 'incorrect-font-family',
				passageEditorFontScale: 1.75
			}
		});

		const editor = screen.getByTestId('mock-code-area');

		expect(editor.dataset.fontFamily).toBe('mock-font-family');
		expect(editor.dataset.fontScale).toBe('2');
	});

	it('sets the code area in CSS mode and autofocuses it', () => {
		renderComponent();
		expect(
			JSON.parse(screen.getByTestId('mock-code-area')!.dataset.options!)
		).toEqual(expect.objectContaining({autofocus: true, mode: 'css'}));
	});

	it('blinks the cursor if that preference is not set', () => {
		renderComponent({prefs: {editorCursorBlinks: true}});
		expect(
			JSON.parse(screen.getByTestId('mock-code-area')!.dataset.options!)
		).not.toEqual(expect.objectContaining({cursorBlinkRate: 0}));
	});

	it("doesn't blink the cursor if that preference is set", () => {
		renderComponent({prefs: {editorCursorBlinks: false}});
		expect(
			JSON.parse(screen.getByTestId('mock-code-area')!.dataset.options!)
		).toEqual(expect.objectContaining({cursorBlinkRate: 0}));
	});

	it.todo('indents code with its indent buttons');
	it.todo('undos and redos changes with the undo/redo buttons');

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
