import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {ErrorMessage} from '../error-message';

describe('<ErrorMessage>', () => {
	function renderComponent() {
		return render(<ErrorMessage>children</ErrorMessage>);
	}

	it('renders its children', () => {
		renderComponent();
		expect(screen.getByText('children')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
