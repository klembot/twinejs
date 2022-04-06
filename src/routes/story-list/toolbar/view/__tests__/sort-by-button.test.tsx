import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	PrefInspector
} from '../../../../../test-util';
import {SortByButton} from '../sort-by-button';

jest.mock('../../../../../components/control/menu-button');

describe('<SortByButton>', () => {
	function renderComponent(contexts?: FakeStateProviderProps) {
		return render(
			<FakeStateProvider {...contexts}>
				<SortByButton />
				<PrefInspector name="storyListSort" />
			</FakeStateProvider>
		);
	}

	it('displays a button that sets the story sort order to date', () => {
		renderComponent({prefs: {storyListSort: 'name'}});
		fireEvent.click(screen.getByText('routes.storyList.toolbar.sortByDate'));
		expect(
			screen.getByTestId('pref-inspector-storyListSort')
		).toHaveTextContent('date');
	});

	it('displays a button that sets the story sort order to name', () => {
		renderComponent({prefs: {storyListSort: 'date'}});
		fireEvent.click(screen.getByText('routes.storyList.toolbar.sortByName'));
		expect(
			screen.getByTestId('pref-inspector-storyListSort')
		).toHaveTextContent('name');
	});

	it('checks the button reflecting the current sort state', () => {
		renderComponent({prefs: {storyListSort: 'name'}});
		expect(
			screen.getByRole('checkbox', {
				name: 'routes.storyList.toolbar.sortByDate'
			})
		).not.toBeChecked();
		expect(
			screen.getByRole('checkbox', {
				name: 'routes.storyList.toolbar.sortByName'
			})
		).toBeChecked();

		cleanup();
		renderComponent({prefs: {storyListSort: 'date'}});
		expect(
			screen.getByRole('checkbox', {
				name: 'routes.storyList.toolbar.sortByDate'
			})
		).toBeChecked();
		expect(
			screen.getByRole('checkbox', {
				name: 'routes.storyList.toolbar.sortByName'
			})
		).not.toBeChecked();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
