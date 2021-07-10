import * as React from 'react';
import {LoadingCurtain} from '../loading-curtain';
import {render} from '@testing-library/react';
import {axe} from 'jest-axe';

describe('<LoadingCurtain>', () => {
	it('renders', () => expect(() => render(<LoadingCurtain />)).not.toThrow());

	it('is accessible', async () => {
		const {container} = render(<LoadingCurtain />);
		expect(await axe(container)).toHaveNoViolations();
	});
});
