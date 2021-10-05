import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {DialogEditor} from '../dialog-editor';

describe('<DialogEditor>', () => {
	it('renders its children', () => {
		render(<DialogEditor>children</DialogEditor>);
		expect(screen.getByText('children')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = render(<DialogEditor>children</DialogEditor>);

		expect(await axe(container)).toHaveNoViolations();
	});
});
