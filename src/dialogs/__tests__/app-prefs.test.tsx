import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	PrefInspector
} from '../../test-util';
import {AppPrefsDialog} from '../app-prefs';

describe('<AppPrefsDialog>', () => {
	function renderComponent(context?: FakeStateProviderProps['prefs']) {
		return render(
			<FakeStateProvider prefs={context}>
				<AppPrefsDialog
					collapsed={false}
					onChangeCollapsed={jest.fn()}
					onChangeHighlighted={jest.fn()}
					onChangeMaximized={jest.fn()}
					onClose={jest.fn()}
				/>
				<PrefInspector name="appTheme" />
				<PrefInspector name="codeEditorFontFamily" />
				<PrefInspector name="codeEditorFontScale" />
				<PrefInspector name="dialogWidth" />
				<PrefInspector name="editorCursorBlinks" />
				<PrefInspector name="locale" />
				<PrefInspector name="passageEditorFontFamily" />
				<PrefInspector name="passageEditorFontScale" />
			</FakeStateProvider>
		);
	}

	it('displays the theme preference', () => {
		renderComponent({appTheme: 'dark'});
		expect(screen.getByLabelText('dialogs.appPrefs.theme')).toHaveValue('dark');
	});

	it('changes the theme preference when the menu is changed', () => {
		renderComponent({appTheme: 'dark'});
		fireEvent.change(screen.getByLabelText('dialogs.appPrefs.theme'), {
			target: {value: 'light'}
		});
		expect(screen.getByTestId('pref-inspector-appTheme')).toHaveTextContent(
			'light'
		);
	});

	it('displays the locale preference', () => {
		renderComponent({locale: 'ca'});
		expect(screen.getByLabelText('dialogs.appPrefs.language')).toHaveValue(
			'ca'
		);
	});

	it('uses the closest app locale possible', () => {
		renderComponent({locale: 'en-US'});
		expect(screen.getByLabelText('dialogs.appPrefs.language')).toHaveValue(
			'en'
		);
	});

	it('changes to the locale preference when the menu is changed', () => {
		renderComponent({locale: 'ca'});
		fireEvent.change(screen.getByLabelText('dialogs.appPrefs.language'), {
			target: {value: 'cs'}
		});
		expect(screen.getByTestId('pref-inspector-locale')).toHaveTextContent('cs');
	});

	it('displays the dialog width preference', () => {
		renderComponent({dialogWidth: 600});
		expect(screen.getByLabelText('dialogs.appPrefs.dialogWidth')).toHaveValue(
			'600'
		);
		cleanup();
		renderComponent({dialogWidth: 700});
		expect(screen.getByLabelText('dialogs.appPrefs.dialogWidth')).toHaveValue(
			'700'
		);
		cleanup();
		renderComponent({dialogWidth: 800});
		expect(screen.getByLabelText('dialogs.appPrefs.dialogWidth')).toHaveValue(
			'800'
		);
	});

	it('changes the dialog width preference when the menu is changed', () => {
		renderComponent({dialogWidth: 700});
		fireEvent.change(screen.getByLabelText('dialogs.appPrefs.dialogWidth'), {
			target: {value: '600'}
		});
		expect(screen.getByTestId('pref-inspector-dialogWidth')).toHaveTextContent(
			'600'
		);
	});

	it('displays the editor cursor blink preference', () => {
		renderComponent({editorCursorBlinks: true});
		expect(
			screen.getByRole('checkbox', {
				name: 'dialogs.appPrefs.editorCursorBlinks'
			})
		).toBeChecked();
		cleanup();
		renderComponent({editorCursorBlinks: false});
		expect(
			screen.getByRole('checkbox', {
				name: 'dialogs.appPrefs.editorCursorBlinks'
			})
		).not.toBeChecked();
	});

	it('changes the editor cursor blink preference when the button is clicked', () => {
		renderComponent({editorCursorBlinks: true});
		fireEvent.click(screen.getByText('dialogs.appPrefs.editorCursorBlinks'));
		expect(
			screen.getByTestId('pref-inspector-editorCursorBlinks')
		).toHaveTextContent('false');
		fireEvent.click(screen.getByText('dialogs.appPrefs.editorCursorBlinks'));
		expect(
			screen.getByTestId('pref-inspector-editorCursorBlinks')
		).toHaveTextContent('true');
	});

	it('displays the passage font preference', () => {
		renderComponent({
			passageEditorFontFamily: 'var(--font-monospaced)',
			passageEditorFontScale: 2
		});
		expect(
			screen.getByLabelText('dialogs.appPrefs.passageEditorFont')
		).toHaveValue('var(--font-monospaced)');
		expect(
			screen.getByLabelText('dialogs.appPrefs.passageEditorFontScale')
		).toHaveValue('2');
	});

	it('changes the passage font family preference when edited', () => {
		renderComponent();
		fireEvent.change(
			screen.getByLabelText('dialogs.appPrefs.passageEditorFont'),
			{
				target: {value: 'var(--font-monospaced)'}
			}
		);
		expect(
			screen.getByTestId('pref-inspector-passageEditorFontFamily')
		).toHaveTextContent('var(--font-monospaced)');
	});

	it('changes the passage font scale preference when edited', () => {
		renderComponent();
		fireEvent.change(
			screen.getByLabelText('dialogs.appPrefs.passageEditorFontScale'),
			{
				target: {value: '1.25'}
			}
		);
		expect(
			screen.getByTestId('pref-inspector-passageEditorFontScale')
		).toHaveTextContent('1.25');
	});

	it('displays the code font preference', () => {
		renderComponent({
			codeEditorFontFamily: 'var(--font-system)',
			codeEditorFontScale: 2
		});
		expect(
			screen.getByLabelText('dialogs.appPrefs.codeEditorFont')
		).toHaveValue('var(--font-system)');
		expect(
			screen.getByLabelText('dialogs.appPrefs.codeEditorFontScale')
		).toHaveValue('2');
	});

	it('changes the code font family preference when edited', () => {
		renderComponent();
		fireEvent.change(screen.getByLabelText('dialogs.appPrefs.codeEditorFont'), {
			target: {value: 'var(--font-system)'}
		});
		expect(
			screen.getByTestId('pref-inspector-codeEditorFontFamily')
		).toHaveTextContent('var(--font-system)');
	});

	it('changes the code font scale preference when edited', () => {
		renderComponent();
		fireEvent.change(
			screen.getByLabelText('dialogs.appPrefs.codeEditorFontScale'),
			{
				target: {value: '1.25'}
			}
		);
		expect(
			screen.getByTestId('pref-inspector-codeEditorFontScale')
		).toHaveTextContent('1.25');
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
