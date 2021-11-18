import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {PrefsContext, PrefsContextProps} from '../../store/prefs';
import {StoriesContext, StoriesContextProps} from '../../store/stories';
import {fakePrefs, fakeStory} from '../../test-util';
import {
	StoryStylesheetDialog,
	StoryStylesheetDialogProps
} from '../story-stylesheet';

jest.mock('../../components/control/code-area/code-area');

describe('<StoryStylesheetDialog>', () => {
	function renderComponent(
		props?: Partial<StoryStylesheetDialogProps>,
		storiesContext?: Partial<StoriesContextProps>,
		prefsContext?: Partial<PrefsContextProps>
	) {
		const story = fakeStory();

		return render(
			<PrefsContext.Provider
				value={{dispatch: jest.fn(), prefs: fakePrefs(), ...prefsContext}}
			>
				<StoriesContext.Provider
					value={{dispatch: jest.fn(), stories: [story], ...storiesContext}}
				>
					<StoryStylesheetDialog
						collapsed={false}
						onChangeCollapsed={jest.fn()}
						onClose={jest.fn()}
						storyId={story.id}
						{...props}
					/>
				</StoriesContext.Provider>
			</PrefsContext.Provider>
		);
	}

	it("displays the story's stylesheet", () => {
		const story = fakeStory();

		story.stylesheet = 'mock-story-stylesheet';

		renderComponent({storyId: story.id}, {stories: [story]});

		expect(
			screen.getByLabelText('dialogs.storyStylesheet.editorLabel')
		).toHaveValue('mock-story-stylesheet');
	});

	it('dispatches changes to the story as edits are made', () => {
		const dispatch = jest.fn();
		const story = fakeStory();

		renderComponent({storyId: story.id}, {dispatch, stories: [story]});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.change(
			screen.getByLabelText('dialogs.storyStylesheet.editorLabel'),
			{
				target: {value: 'mock-change'}
			}
		);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updateStory',
					storyId: story.id,
					props: {stylesheet: 'mock-change'}
				}
			]
		]);
	});

	it('uses the code editor font preferences', () => {
		renderComponent(
			{},
			{},
			{
				prefs: {
					codeEditorFontFamily: 'mock-font-family',
					codeEditorFontScale: 2,
					passageEditorFontFamily: 'incorrect-font-family',
					passageEditorFontScale: 1.75
				} as any
			}
		);

		const editor = screen.getByTestId('mock-code-area');

		expect(editor.dataset.fontFamily).toBe('mock-font-family');
		expect(editor.dataset.fontScale).toBe('2');
	});

	it('sets the code area in CSS mode and autofocuses it', () => {
		renderComponent();
		expect(
			JSON.parse(screen.getByTestId('mock-code-area')!.dataset.options!)
		).toEqual({autofocus: true, mode: 'css'});
	});

	it.todo('indents code with its indent buttons');
	it.todo('undos and redos changes with the undo/redo buttons');

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
