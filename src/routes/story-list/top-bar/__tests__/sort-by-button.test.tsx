import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {PrefsContext, PrefsContextProps} from '../../../../store/prefs';
import {fakePrefs} from '../../../../test-util';
import {SortByButton} from '../sort-by-button';

jest.mock('../../../../components/control/menu-button');

describe('<SortByButton>', () => {
	function renderComponent(context?: Partial<PrefsContextProps>) {
		return render(
			<PrefsContext.Provider
				value={{dispatch: jest.fn(), prefs: fakePrefs(), ...context}}
			>
				<SortByButton />
			</PrefsContext.Provider>
		);
	}

	it('displays a button that dispatches a change to sort stories by date', () => {
		const dispatch = jest.fn();

		renderComponent({dispatch});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('routes.storyList.topBar.sortDate'));
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'update',
					name: 'storyListSort',
					value: 'date'
				}
			]
		]);
	});

	it('displays a button that dispatches a change to sort stories by name', () => {
		const dispatch = jest.fn();

		renderComponent({dispatch});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('routes.storyList.topBar.sortName'));
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'update',
					name: 'storyListSort',
					value: 'name'
				}
			]
		]);
	});

	it('checks the button reflecting the current sort state', () => {
		let prefs = fakePrefs({storyListSort: 'name'});

		renderComponent({prefs});
		expect(
			screen.getByRole('checkbox', {name: 'routes.storyList.topBar.sortDate'})
		).not.toBeChecked();
		expect(
			screen.getByRole('checkbox', {name: 'routes.storyList.topBar.sortName'})
		).toBeChecked();

		cleanup();
		prefs = fakePrefs({storyListSort: 'date'});
		renderComponent({prefs});
		expect(
			screen.getByRole('checkbox', {name: 'routes.storyList.topBar.sortDate'})
		).toBeChecked();
		expect(
			screen.getByRole('checkbox', {name: 'routes.storyList.topBar.sortName'})
		).not.toBeChecked();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
