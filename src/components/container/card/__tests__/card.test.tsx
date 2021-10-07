import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Card, CardProps} from '../card';

describe('<Card>', () => {
	function renderComponent(props?: Partial<CardProps>) {
		return render(
			<Card {...props}>
				<div data-testid="mock-card-child" />
			</Card>
		);
	}

	it('renders its children', () => {
		renderComponent();
		expect(screen.getByTestId('mock-card-child')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
