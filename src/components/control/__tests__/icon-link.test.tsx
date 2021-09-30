import * as React from 'react';
import {axe} from 'jest-axe';
import {render, screen} from '@testing-library/react';
import {IconLink, IconLinkProps} from '../icon-link';

describe('<IconLink>', () => {
	function renderComponent(props?: Partial<IconLinkProps>) {
		return render(
			<IconLink
				href="mock-href"
				icon={<span data-testid="mock-icon" />}
				label="mock-label"
				{...props}
			/>
		);
	}

	it('renders a link to the href specified', () => {
		renderComponent({href: 'test-href'});

		const link = screen.getByRole('link');

		expect(link).toBeInTheDocument();
		expect(link.getAttribute('href')).toBe('test-href');
	});

	it('renders a link with the target specified', () => {
		renderComponent({target: '__blank'});
		expect(screen.getByRole('link').getAttribute('target')).toBe('__blank');
	});

	it('renders the icon prop', () => {
		renderComponent();
		expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
	});

	it('renders the label prop', () => {
		renderComponent();
		expect(screen.getByText('mock-label')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
