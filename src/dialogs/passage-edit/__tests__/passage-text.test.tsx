import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../store/stories';
import {useFormatCodeMirrorMode} from '../../../store/use-format-codemirror-mode';
import {
	fakeLoadedStoryFormat,
	fakePassage,
	fakePrefs,
	FakeStateProvider,
	FakeStateProviderProps
} from '../../../test-util';
import {PassageText, PassageTextProps} from '../passage-text';

jest.mock('../../../store/use-codemirror-passage-hints');
jest.mock('../../../store/use-format-codemirror-mode');
jest.mock('../../../components/control/code-area/code-area');

const TestPassageText: React.FC<Partial<PassageTextProps>> = props => {
	const {stories} = useStoriesContext();

	return (
		<PassageText
			onChange={jest.fn()}
			onEditorChange={jest.fn()}
			passage={stories[0].passages[0]}
			storyFormat={fakeLoadedStoryFormat()}
			story={stories[0]}
			{...props}
		/>
	);
};

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
		contexts?: FakeStateProviderProps
	) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestPassageText {...props} />
			</FakeStateProvider>
		);
	}

	it('displays the passage text', () => {
		renderComponent({passage: fakePassage({text: 'mock-text'})});
		expect(
			screen.getByLabelText('dialogs.passageEdit.passageTextEditorLabel')
		).toHaveValue('mock-text');
	});

	it('updates the passage text if it has been changed elsewhere', () => {
		const onChange = jest.fn();
		const onEditorChange = jest.fn();
		const passage = fakePassage({text: 'mock-text'});
		const storyFormat = fakeLoadedStoryFormat();

		const {rerender} = render(
			<FakeStateProvider>
				<PassageText
					onChange={onChange}
					onEditorChange={onEditorChange}
					passage={passage}
					storyFormat={storyFormat}
				/>
			</FakeStateProvider>
		);

		passage.text = 'mock-changed-text';
		rerender(
			<FakeStateProvider>
				<PassageText
					onChange={onChange}
					onEditorChange={onEditorChange}
					passage={passage}
					storyFormat={storyFormat}
				/>
			</FakeStateProvider>
		);
		expect(
			screen.getByLabelText('dialogs.passageEdit.passageTextEditorLabel')
		).toHaveValue('mock-changed-text');
	});

	it('ignores a passage text change if a manual edit is pending', async () => {
		const onChange = jest.fn();
		const onEditorChange = jest.fn();
		const passage = fakePassage({text: 'mock-text'});
		const storyFormat = fakeLoadedStoryFormat();

		const {rerender} = render(
			<FakeStateProvider>
				<PassageText
					onChange={onChange}
					onEditorChange={onEditorChange}
					passage={passage}
					storyFormat={storyFormat}
				/>
			</FakeStateProvider>
		);

		fireEvent.change(
			screen.getByLabelText('dialogs.passageEdit.passageTextEditorLabel'),
			{target: {value: 'mock-manual-change'}}
		);
		passage.text = 'mock-externally-changed-text';
		rerender(
			<FakeStateProvider>
				<PassageText
					onChange={onChange}
					onEditorChange={onEditorChange}
					passage={passage}
					storyFormat={storyFormat}
				/>
			</FakeStateProvider>
		);
		expect(
			screen.getByLabelText('dialogs.passageEdit.passageTextEditorLabel')
		).toHaveValue('mock-manual-change');
	});

	// Need to mock <CodeArea /> with higher fidelity to do these.
	it.todo('focuses the code area after a delay on mount');
	it.todo('executes a command when the onExecCommand prop is called');
	it.todo('retains the selection after the onExecCommand prop is called');

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

	it('sets up autocompletion of passage names in links', () => {
		useFormatCodeMirrorModeMock.mockReturnValue(undefined);
		renderComponent();

		const options = JSON.parse(
			screen.getByTestId('mock-code-area').dataset.options!
		);

		expect(options.prefixTrigger).not.toBeUndefined();
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

	it('blinks the cursor if that preference is not set', () => {
		renderComponent({}, {prefs: {editorCursorBlinks: true}});
		expect(
			JSON.parse(screen.getByTestId('mock-code-area')!.dataset.options!)
		).not.toEqual(expect.objectContaining({cursorBlinkRate: 0}));
	});

	it("doesn't blink the cursor if that preference is set", () => {
		renderComponent({}, {prefs: {editorCursorBlinks: false}});
		expect(
			JSON.parse(screen.getByTestId('mock-code-area')!.dataset.options!)
		).toEqual(expect.objectContaining({cursorBlinkRate: 0}));
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
