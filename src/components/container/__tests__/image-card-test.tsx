import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {ImageCard, ImageCardProps} from '../image-card';

describe('<ButtonCard>', () => {
	function renderComponent(props?: ImageCardProps) {
		return render(
			<ImageCard image={<div data-testid="mock-image-card-image" />} {...props}>
				<div data-testid="mock-image-card-child" />
			</ImageCard>
		);
	}

	it('renders its children', () => {
		renderComponent();
		expect(screen.getByTestId('mock-image-card-child')).toBeInTheDocument();
	});

	it('renders its image', () => {
		renderComponent();
		expect(screen.getByTestId('mock-image-card-image')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
