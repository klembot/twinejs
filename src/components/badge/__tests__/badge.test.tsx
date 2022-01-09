import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Badge} from '../badge';

describe('<Badge>', () => {
	function renderComponent() {
		return render(<Badge label="mock-label" />);
	}

	it('displays its label', () => {
		renderComponent();
		expect(screen.getByText('mock-label')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
