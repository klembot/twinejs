import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {StoryFormatsFilterButton} from '../story-formats-filter-button';
import {FakeStateProvider, PrefInspector} from '../../../test-util';
import {PrefsState} from '../../../store/prefs';

describe('<StoryFormatsFilterButton>', () => {
	const prefs: ('all' | 'current' | 'user')[][] = [
		['all'],
		['current'],
		['user']
	];

	function renderComponent(prefs?: Partial<PrefsState>) {
		return render(
			<FakeStateProvider prefs={prefs}>
				<StoryFormatsFilterButton />
				<PrefInspector name="storyFormatListFilter" />
			</FakeStateProvider>
		);
	}

	describe.each(prefs)(
		'When the current story format filter is %s',
		storyFormatListFilter => {
			it('displays the label for this state', () => {
				renderComponent({storyFormatListFilter});
				expect(
					screen.getByRole('button', {
						name: `dialogs.storyFormats.filterButton.${storyFormatListFilter}`
					})
				).toBeInTheDocument();
			});

			it('checks the appropriate item in the menu', () => {
				renderComponent({storyFormatListFilter});
				fireEvent.click(
					screen.getByRole('button', {
						name: `dialogs.storyFormats.filterButton.${storyFormatListFilter}`
					})
				);
				expect(
					screen.getByRole('checkbox', {
						name: `dialogs.storyFormats.filterButton.${storyFormatListFilter}`
					})
				).toBeChecked();
			});

			it('unchecks all other items in the menu', () => {
				expect.assertions(prefs.length - 1);
				renderComponent({storyFormatListFilter});
				fireEvent.click(
					screen.getByRole('button', {
						name: `dialogs.storyFormats.filterButton.${storyFormatListFilter}`
					})
				);

				for (const pref of prefs.filter(
					([item]) => item !== storyFormatListFilter
				)) {
					expect(
						screen.getByRole('checkbox', {
							name: `dialogs.storyFormats.filterButton.${pref}`
						})
					).not.toBeChecked();
				}
			});
		}
	);

	it.each(prefs)(
		'Dispatches a preference update when the %s menu item is selected',
		pref => {
			renderComponent();
			fireEvent.click(screen.getByRole('button'));
			fireEvent.click(
				screen.getByRole('checkbox', {
					name: `dialogs.storyFormats.filterButton.${pref}`
				})
			);
			expect(
				screen.getByTestId('pref-inspector-storyFormatListFilter')
			).toHaveTextContent(pref);
		}
	);

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
