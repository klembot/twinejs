import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {PrefsContext, PrefsContextProps} from '../../store/prefs';
import {fakePrefs} from '../../test-util';
import {AppPrefsDialog} from '../app-prefs';

describe('<AppPrefsDialog>', () => {
	function renderComponent(context?: Partial<PrefsContextProps>) {
		return render(
			<PrefsContext.Provider
				value={{dispatch: jest.fn(), prefs: fakePrefs(), ...context}}
			>
				<AppPrefsDialog
					collapsed={false}
					onChangeCollapsed={jest.fn()}
					onClose={jest.fn()}
				/>
			</PrefsContext.Provider>
		);
	}

	it('displays the theme preference', () => {
		const prefs = fakePrefs({appTheme: 'dark'});

		renderComponent({prefs});
		expect(screen.getByLabelText('dialogs.appPrefs.theme')).toHaveValue('dark');
	});

	it('dispatches changes to the theme preference', () => {
		const dispatch = jest.fn();

		renderComponent({dispatch});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.change(screen.getByLabelText('dialogs.appPrefs.theme'), {
			target: {value: 'light'}
		});
		expect(dispatch.mock.calls).toEqual([
			[{name: 'appTheme', type: 'update', value: 'light'}]
		]);
	});

	it('displays the locale preference', () => {
		const prefs = fakePrefs({locale: 'ca'});

		renderComponent({prefs});
		expect(screen.getByLabelText('dialogs.appPrefs.language')).toHaveValue(
			'ca'
		);
	});

	it('dispatches changes to the locale preference', () => {
		const dispatch = jest.fn();

		renderComponent({dispatch});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.change(screen.getByLabelText('dialogs.appPrefs.language'), {
			target: {value: 'cs'}
		});
		expect(dispatch.mock.calls).toEqual([
			[{name: 'locale', type: 'update', value: 'cs'}]
		]);
	});

	it('displays the passage font preference', () => {
		const prefs = fakePrefs({
			passageEditorFontFamily: 'var(--font-monospaced)',
			passageEditorFontScale: 2
		});

		renderComponent({prefs});
		expect(
			screen.getByLabelText('dialogs.appPrefs.passageEditorFont')
		).toHaveValue('var(--font-monospaced)');
		expect(
			screen.getByLabelText('dialogs.appPrefs.passageEditorFontScale')
		).toHaveValue('2');
	});

	it('dispatches changes to the passage font family', () => {
		const dispatch = jest.fn();

		renderComponent({dispatch});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.change(
			screen.getByLabelText('dialogs.appPrefs.passageEditorFont'),
			{
				target: {value: 'var(--font-monospaced)'}
			}
		);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					name: 'passageEditorFontFamily',
					type: 'update',
					value: 'var(--font-monospaced)'
				}
			]
		]);
	});

	it('dispatches changes to the passage font scale', () => {
		const dispatch = jest.fn();

		renderComponent({dispatch});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.change(
			screen.getByLabelText('dialogs.appPrefs.passageEditorFontScale'),
			{
				target: {value: '1.25'}
			}
		);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					name: 'passageEditorFontScale',
					type: 'update',
					value: 1.25
				}
			]
		]);
	});

	it('displays the code font preference', () => {
		const prefs = fakePrefs({
			codeEditorFontFamily: 'var(--font-system)',
			codeEditorFontScale: 2
		});

		renderComponent({prefs});
		expect(
			screen.getByLabelText('dialogs.appPrefs.codeEditorFont')
		).toHaveValue('var(--font-system)');
		expect(
			screen.getByLabelText('dialogs.appPrefs.codeEditorFontScale')
		).toHaveValue('2');
	});

	it('dispatches changes to the code font family', () => {
		const dispatch = jest.fn();

		renderComponent({dispatch});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.change(screen.getByLabelText('dialogs.appPrefs.codeEditorFont'), {
			target: {value: 'var(--font-system)'}
		});
		expect(dispatch.mock.calls).toEqual([
			[
				{
					name: 'codeEditorFontFamily',
					type: 'update',
					value: 'var(--font-system)'
				}
			]
		]);
	});

	it('dispatches changes to the code font scale', () => {
		const dispatch = jest.fn();

		renderComponent({dispatch});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.change(
			screen.getByLabelText('dialogs.appPrefs.codeEditorFontScale'),
			{
				target: {value: '1.25'}
			}
		);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					name: 'codeEditorFontScale',
					type: 'update',
					value: 1.25
				}
			]
		]);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
