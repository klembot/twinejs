import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {ButtonCard} from '../button-card';

describe('<ButtonCard>', () => {
	it('renders its children', () => {
		render(<ButtonCard>children</ButtonCard>);
		expect(screen.getByText('children')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = render(<ButtonCard>children</ButtonCard>);

		expect(await axe(container)).toHaveNoViolations();
	});
});
