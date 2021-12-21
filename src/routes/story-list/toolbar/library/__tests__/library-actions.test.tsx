import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {LibraryActions} from '../library-actions';

describe('<LibraryActions>', () => {
	function renderComponent() {
		return render(<LibraryActions />);
	}

	it('displays an archive button', () => {
		renderComponent();
		expect(
			screen.getByText('routes.storyList.toolbar.archive')
		).toBeInTheDocument();
	});

	it('displays a story tags button', () => {
		renderComponent();
		expect(
			screen.getByText('routes.storyList.toolbar.archive')
		).toBeInTheDocument();
	});

	it('displays a story import button', () => {
		renderComponent();
		expect(screen.getByText('common.import')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
