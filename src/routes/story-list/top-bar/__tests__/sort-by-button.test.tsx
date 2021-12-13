import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {PrefsState} from '../../../../store/prefs';
import {PrefInspector, FakeStateProvider} from '../../../../test-util';
import {SortByButton} from '../sort-by-button';

jest.mock('../../../../components/control/menu-button');

describe('<SortByButton>', () => {
	function renderComponent(prefs?: Partial<PrefsState>) {
		return render(
			<FakeStateProvider prefs={prefs}>
				<SortByButton />
				<PrefInspector name="storyListSort" />
			</FakeStateProvider>
		);
	}

	it('displays a button that sets the story sort order to date', () => {
		renderComponent({storyListSort: 'name'});
		fireEvent.click(screen.getByText('routes.storyList.topBar.sortDate'));
		expect(
			screen.getByTestId('pref-inspector-storyListSort')
		).toHaveTextContent('date');
	});

	it('displays a button that sets the story sort order to name', () => {
		renderComponent({storyListSort: 'date'});
		fireEvent.click(screen.getByText('routes.storyList.topBar.sortName'));
		expect(
			screen.getByTestId('pref-inspector-storyListSort')
		).toHaveTextContent('name');
	});

	it('checks the button reflecting the current sort state', () => {
		renderComponent({storyListSort: 'name'});
		expect(
			screen.getByRole('checkbox', {name: 'routes.storyList.topBar.sortDate'})
		).not.toBeChecked();
		expect(
			screen.getByRole('checkbox', {name: 'routes.storyList.topBar.sortName'})
		).toBeChecked();

		cleanup();
		renderComponent({storyListSort: 'date'});
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
