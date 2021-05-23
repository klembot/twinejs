import * as React from 'react';
import {axe} from 'jest-axe';
import {cleanup, render, screen} from '@testing-library/react';
import {Meter, MeterProps} from '../meter';

function renderComponent(props?: Partial<MeterProps>) {
	return render(
		<Meter domId="mock-id" percent={0} {...props}>
			Label
		</Meter>
	);
}

describe('<Meter>', () => {
	it('renders a meter with the appropriate percent', () => {
		renderComponent({percent: 0});
		expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('0');
		cleanup();
		renderComponent({percent: 0.5});
		expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('50');
		cleanup();
		renderComponent({percent: 1});
		expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('100');
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
