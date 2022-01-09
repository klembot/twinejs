import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {FakeStateProvider} from '../../../../../test-util';
import {ViewActions} from '../view-actions';

describe('<ViewActions>', () => {
	function renderComponent() {
		return render(
			<FakeStateProvider>
				<ViewActions />
			</FakeStateProvider>
		);
	}

	it('displays a sort button', () => {
		renderComponent();
		expect(
			screen.getByText('routes.storyList.toolbar.sort')
		).toBeInTheDocument();
	});

	it('displays a tag filter button', () => {
		renderComponent();
		expect(
			screen.getByText('routes.storyList.toolbar.showTags')
		).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
