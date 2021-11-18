import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {PrefsContext, PrefsContextProps} from '../../../store/prefs';
import {useFormatCodeMirrorMode} from '../../../store/use-format-codemirror-mode';
import {
	fakeLoadedStoryFormat,
	fakePassage,
	fakePrefs
} from '../../../test-util';
import {PassageText, PassageTextProps} from '../passage-text';

jest.mock('../story-format-toolbar');
jest.mock('../../../store/use-format-codemirror-mode');
jest.mock('../../../components/control/code-area/code-area');

describe('<PassageText>', () => {
	const useFormatCodeMirrorModeMock = useFormatCodeMirrorMode as jest.Mock;

	beforeEach(() => {
		jest.useFakeTimers();
		useFormatCodeMirrorModeMock.mockReturnValue(undefined);
	});

	afterEach(() => {
		jest.clearAllTimers();
		jest.useRealTimers();
	});

	function renderComponent(
		props?: Partial<PassageTextProps>,
		prefsContext?: Partial<PrefsContextProps>
	) {
		return render(
			<PrefsContext.Provider
				value={{dispatch: jest.fn(), prefs: fakePrefs(), ...prefsContext}}
			>
				<PassageText
					onChange={jest.fn()}
					onEditorChange={jest.fn()}
					passage={fakePassage()}
					storyFormat={fakeLoadedStoryFormat()}
					{...props}
				/>
			</PrefsContext.Provider>
		);
	}

	it('displays the format toolbar', () => {
		const storyFormat = fakeLoadedStoryFormat();

		renderComponent({storyFormat});
		expect(
			screen.getByTestId(`mock-story-format-toolbar-${storyFormat.id}`)
		).toBeInTheDocument();
	});

	it('displays the passage text', () => {
		renderComponent({passage: fakePassage({text: 'mock-text'})});
		expect(
			screen.getByLabelText('dialogs.passageEdit.passageTextEditorLabel')
		).toHaveValue('mock-text');
	});

	it('updates the passage text if it has been changed elsewhere', () => {
		const dispatch = jest.fn();
		const onChange = jest.fn();
		const onEditorChange = jest.fn();
		const passage = fakePassage({text: 'mock-text'});
		const prefs = fakePrefs();
		const storyFormat = fakeLoadedStoryFormat();

		const {rerender} = render(
			<PrefsContext.Provider value={{dispatch, prefs}}>
				<PassageText
					onChange={onChange}
					onEditorChange={onEditorChange}
					passage={passage}
					storyFormat={storyFormat}
				/>
			</PrefsContext.Provider>
		);

		passage.text = 'mock-changed-text';
		rerender(
			<PrefsContext.Provider value={{dispatch, prefs}}>
				<PassageText
					onChange={onChange}
					onEditorChange={onEditorChange}
					passage={passage}
					storyFormat={storyFormat}
				/>
			</PrefsContext.Provider>
		);
		expect(
			screen.getByLabelText('dialogs.passageEdit.passageTextEditorLabel')
		).toHaveValue('mock-changed-text');
	});

	it('ignores a passage text change if a manual edit is pending', async () => {
		const dispatch = jest.fn();
		const onChange = jest.fn();
		const onEditorChange = jest.fn();
		const passage = fakePassage({text: 'mock-text'});
		const prefs = fakePrefs();
		const storyFormat = fakeLoadedStoryFormat();

		const {rerender} = render(
			<PrefsContext.Provider value={{dispatch, prefs}}>
				<PassageText
					onChange={onChange}
					onEditorChange={onEditorChange}
					passage={passage}
					storyFormat={storyFormat}
				/>
			</PrefsContext.Provider>
		);

		fireEvent.change(
			screen.getByLabelText('dialogs.passageEdit.passageTextEditorLabel'),
			{target: {value: 'mock-manual-change'}}
		);
		passage.text = 'mock-externally-changed-text';
		rerender(
			<PrefsContext.Provider value={{dispatch, prefs}}>
				<PassageText
					onChange={onChange}
					onEditorChange={onEditorChange}
					passage={passage}
					storyFormat={storyFormat}
				/>
			</PrefsContext.Provider>
		);
		expect(
			screen.getByLabelText('dialogs.passageEdit.passageTextEditorLabel')
		).toHaveValue('mock-manual-change');
	});

	// Need to mock <CodeArea /> with higher fidelity to do this.
	it.todo('focuses the code area after a delay on mount');

	it('sets the format mode on the code area if one exists', () => {
		useFormatCodeMirrorModeMock.mockReturnValue('mock-format-mode-name');
		renderComponent();

		const options = JSON.parse(
			screen.getByTestId('mock-code-area').dataset.options!
		);

		expect(options.mode).toBe('mock-format-mode-name');
	});

	it('sets the syntax mode to text if no format mode exists', () => {
		useFormatCodeMirrorModeMock.mockReturnValue(undefined);
		renderComponent();

		const options = JSON.parse(
			screen.getByTestId('mock-code-area').dataset.options!
		);

		expect(options.mode).toBe('text');
	});

	it('uses the passage editor font preferences', () => {
		renderComponent(
			{},
			{
				prefs: fakePrefs({
					passageEditorFontFamily: 'mock-font-family',
					passageEditorFontScale: 2
				})
			}
		);

		expect(screen.getByTestId('mock-code-area').dataset.fontFamily).toBe(
			'mock-font-family'
		);
		expect(screen.getByTestId('mock-code-area').dataset.fontScale).toBe('2');
	});

	it('updates the visible text immediately when the passage text is changed', async () => {
		renderComponent();

		const editor = screen.getByLabelText(
			'dialogs.passageEdit.passageTextEditorLabel'
		);

		fireEvent.change(editor, {target: {value: 'mock-change'}});
		expect(editor).toHaveValue('mock-change');
		fireEvent.change(editor, {target: {value: 'mock-change2'}});
		expect(editor).toHaveValue('mock-change2');
	});

	it('makes debounced calls to the onChange prop when multiple changes are made to the passage text', async () => {
		const onChange = jest.fn();

		renderComponent({onChange});
		expect(onChange).not.toHaveBeenCalled();

		const editor = screen.getByLabelText(
			'dialogs.passageEdit.passageTextEditorLabel'
		);

		fireEvent.change(editor, {target: {value: 'mock-change'}});
		fireEvent.change(editor, {target: {value: 'mock-change2'}});
		expect(onChange).not.toHaveBeenCalled();
		await waitFor(() => expect(onChange).toBeCalledTimes(1));
		expect(onChange.mock.calls).toEqual([['mock-change2']]);
	});

	it('is accessible', async () => {
		jest.useRealTimers();

		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
