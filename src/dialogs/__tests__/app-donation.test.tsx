import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {PrefsContext, PrefsContextProps} from '../../store/prefs';
import {fakePrefs} from '../../test-util';
import {AppDonationDialog} from '../app-donation';
import {DialogComponentProps} from '../dialogs.types';

describe('<AppDonationDialog>', () => {
	function renderComponent(
		props?: Partial<DialogComponentProps>,
		context?: Partial<PrefsContextProps>
	) {
		return render(
			<PrefsContext.Provider
				value={{dispatch: jest.fn(), prefs: fakePrefs(), ...context}}
			>
				<AppDonationDialog
					collapsed={false}
					onChangeCollapsed={jest.fn()}
					onChangeHighlighted={jest.fn()}
					onChangeMaximized={jest.fn()}
					onClose={jest.fn()}
					{...props}
				/>
			</PrefsContext.Provider>
		);
	}

	it('dispatches a setPref action recording that the dialog has been shown when it renders', () => {
		const dispatch = jest.fn();

		renderComponent({}, {dispatch});
		expect(dispatch.mock.calls).toEqual([
			[{type: 'update', name: 'donateShown', value: true}]
		]);
	});

	it('displays a link to donate', () => {
		renderComponent();
		expect(
			screen.getByText('dialogs.appDonation.donate').getAttribute('href')
		).toBe('https://twinery.org/donate');
	});

	it('displays a button which calls the onClose prop', async () => {
		const onClose = jest.fn();

		renderComponent({onClose});
		expect(onClose).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('dialogs.appDonation.noThanks'));
		expect(onClose).toBeCalledTimes(1);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
