import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {PrefsContext, PrefsContextProps} from '../../../../store/prefs';
import {fakePrefs} from '../../../../test-util';
import {TagFilterButton, TagFilterButtonProps} from '../tag-filter-button';

jest.mock('../../../../components/control/menu-button');

describe('<TagFilterButton>', () => {
	function renderComponent(
		props?: Partial<TagFilterButtonProps>,
		context?: Partial<PrefsContextProps>
	) {
		return render(
			<PrefsContext.Provider
				value={{dispatch: jest.fn(), prefs: fakePrefs(), ...context}}
			>
				<TagFilterButton tags={[]} {...props} />{' '}
			</PrefsContext.Provider>
		);
	}

	it('displays a button for every tag specified', () => {
		renderComponent({tags: ['mock-tag-1', 'mock-tag-2']});
		expect(
			screen.getByRole('button', {name: 'mock-tag-1'})
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', {name: 'mock-tag-2'})
		).toBeInTheDocument();
	});

	it('shows tags that are being filtered for as checked', () => {
		renderComponent(
			{tags: ['mock-tag-1', 'mock-tag-2']},
			{prefs: fakePrefs({storyListTagFilter: ['mock-tag-2']})}
		);
		expect(
			screen.getByRole('checkbox', {name: 'mock-tag-1'})
		).not.toBeChecked();
		expect(screen.getByRole('checkbox', {name: 'mock-tag-2'})).toBeChecked();
	});

	it('shows the "Show All Stories" button as checked if no tags are filtered on', () => {
		renderComponent(
			{tags: ['mock-tag-1']},
			{prefs: fakePrefs({storyListTagFilter: []})}
		);
		expect(
			screen.getByRole('checkbox', {name: 'mock-tag-1'})
		).not.toBeChecked();
		expect(
			screen.getByRole('checkbox', {
				name: 'routes.storyList.topBar.showAllStories'
			})
		).toBeChecked();
	});

	it('dispatches an update when a tag is selected', () => {
		const dispatch = jest.fn();
		const prefs = fakePrefs({storyListTagFilter: ['existing-tag']});

		renderComponent({tags: ['mock-tag-1']}, {dispatch, prefs});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole('button', {name: 'mock-tag-1'}));
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'update',
					name: 'storyListTagFilter',
					value: ['existing-tag', 'mock-tag-1']
				}
			]
		]);
	});

	it('dispatches an update when a tag is deselected', () => {
		const dispatch = jest.fn();
		const prefs = fakePrefs({storyListTagFilter: ['existing-tag']});

		renderComponent({tags: ['existing-tag']}, {dispatch, prefs});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole('button', {name: 'existing-tag'}));
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'update',
					name: 'storyListTagFilter',
					value: []
				}
			]
		]);
	});

	it('dispatches an update when the "Show All Stories" button is clicked', () => {
		const dispatch = jest.fn();
		const prefs = fakePrefs({
			storyListTagFilter: ['existing-tag', 'existing-tag-2']
		});

		renderComponent({tags: ['existing-tag']}, {dispatch, prefs});
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(
			screen.getByRole('button', {
				name: 'routes.storyList.topBar.showAllStories'
			})
		);
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'update',
					name: 'storyListTagFilter',
					value: []
				}
			]
		]);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
