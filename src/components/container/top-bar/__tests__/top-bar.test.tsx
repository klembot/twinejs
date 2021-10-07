import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {TopBar} from '../top-bar';

describe('<ButtonBar>', () => {
	it('renders its children', () => {
		render(<TopBar>children</TopBar>);
		expect(screen.getByText('children')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = render(<TopBar>children</TopBar>);

		expect(await axe(container)).toHaveNoViolations();
	});
});
