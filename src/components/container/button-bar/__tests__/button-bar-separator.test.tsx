import {render} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {ButtonBarSeparator} from '../button-bar-separator';

describe('<ButtonBarSeparator>', () => {
	it('renders', () => {
		expect(() => render(<ButtonBarSeparator />)).not.toThrow();
	});

	it('is accessible', async () => {
		const {container} = render(<ButtonBarSeparator />);

		expect(await axe(container)).toHaveNoViolations();
	});
});
