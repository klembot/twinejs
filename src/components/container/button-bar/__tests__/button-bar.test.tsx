import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {ButtonBar} from '../button-bar';

describe('<ButtonBar>', () => {
	it('renders its children', () => {
		render(<ButtonBar>children</ButtonBar>);
		expect(screen.getByText('children')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = render(<ButtonBar>children</ButtonBar>);

		expect(await axe(container)).toHaveNoViolations();
	});
});
