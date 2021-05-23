import * as React from 'react';
import {axe} from 'jest-axe';
import {render, screen} from '@testing-library/react';
import {CardGroup} from '../card-group';

describe('<CardGroup>', () => {
	it('renders its children', () => {
		render(<CardGroup columns={1}>Children</CardGroup>);
		expect(screen.getByText('Children')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = render(<CardGroup columns={1}>Children</CardGroup>);
		expect(await axe(container)).toHaveNoViolations();
	});
});
