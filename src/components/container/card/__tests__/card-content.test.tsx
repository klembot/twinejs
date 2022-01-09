import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {CardContent} from '../card-content';

describe('<CardContent>', () => {
	it('renders its children', () => {
		render(<CardContent>children</CardContent>);
		expect(screen.getByText('children')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = render(<CardContent>children</CardContent>);

		expect(await axe(container)).toHaveNoViolations();
	});
});
