import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {PrefsState} from '../../../../store/prefs';
import {PrefInspector, FakeStateProvider} from '../../../../test-util';
import {TagFilterButton, TagFilterButtonProps} from '../tag-filter-button';

jest.mock('../../../../components/control/menu-button');

describe('<TagFilterButton>', () => {
	function renderComponent(
		props?: Partial<TagFilterButtonProps>,
		prefs?: Partial<PrefsState>
	) {
		return render(
			<FakeStateProvider prefs={prefs}>
				<TagFilterButton tags={[]} {...props} />
				<PrefInspector name="storyListTagFilter" />
			</FakeStateProvider>
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
			{storyListTagFilter: ['mock-tag-2']}
		);
		expect(
			screen.getByRole('checkbox', {name: 'mock-tag-1'})
		).not.toBeChecked();
		expect(screen.getByRole('checkbox', {name: 'mock-tag-2'})).toBeChecked();
	});

	it('shows the "Show All Stories" button as checked if no tags are filtered on', () => {
		renderComponent({tags: ['mock-tag-1']}, {storyListTagFilter: []});
		expect(
			screen.getByRole('checkbox', {name: 'mock-tag-1'})
		).not.toBeChecked();
		expect(
			screen.getByRole('checkbox', {
				name: 'routes.storyList.topBar.showAllStories'
			})
		).toBeChecked();
	});

	it('adds a tag to the story list tag filter preference when selected', () => {
		renderComponent(
			{tags: ['mock-tag-1']},
			{storyListTagFilter: ['existing-tag']}
		);
		fireEvent.click(screen.getByRole('button', {name: 'mock-tag-1'}));
		expect(
			JSON.parse(
				screen.getByTestId('pref-inspector-storyListTagFilter').textContent!
			)
		).toEqual(['existing-tag', 'mock-tag-1']);
	});

	it('removes a tag from the story list tag filter preference when a tag is deselected', () => {
		renderComponent(
			{tags: ['existing-tag']},
			{storyListTagFilter: ['existing-tag']}
		);
		fireEvent.click(screen.getByRole('button', {name: 'existing-tag'}));
		expect(
			JSON.parse(
				screen.getByTestId('pref-inspector-storyListTagFilter').textContent!
			)
		).toEqual([]);
	});

	it('resets the story list tag filter preference when the "Show All Stories" button is clicked', () => {
		renderComponent(
			{tags: ['existing-tag']},
			{
				storyListTagFilter: ['existing-tag', 'existing-tag-2']
			}
		);
		expect(
			JSON.parse(
				screen.getByTestId('pref-inspector-storyListTagFilter').textContent!
			)
		).toEqual(['existing-tag', 'existing-tag-2']);
		fireEvent.click(
			screen.getByRole('button', {
				name: 'routes.storyList.topBar.showAllStories'
			})
		);
		expect(
			JSON.parse(
				screen.getByTestId('pref-inspector-storyListTagFilter').textContent!
			)
		).toEqual([]);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
