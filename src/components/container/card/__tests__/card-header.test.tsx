import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {CardHeader} from '../card-header';

describe('<CardHeader>', () => {
	it('renders its children', () => {
		render(<CardHeader>children</CardHeader>);
		expect(screen.getByText('children')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = render(<CardHeader>children</CardHeader>);

		expect(await axe(container)).toHaveNoViolations();
	});
});
