import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {AboutTwineDialog} from '../about-twine';

describe('<AboutTwineDialog>', () => {
	function renderComponent() {
		return render(
			<AboutTwineDialog
				collapsed={false}
				onChangeCollapsed={jest.fn()}
				onChangeHighlighted={jest.fn()}
				onChangeMaximized={jest.fn()}
				onClose={jest.fn()}
			/>
		);
	}

	it('displays a link to donate', () => {
		renderComponent();
		expect(
			screen.getByText('dialogs.aboutTwine.donateToTwine').getAttribute('href')
		).toBe('https://twinery.org/donate');
	});

	it('displays a link to the code repo', () => {
		renderComponent();
		expect(
			screen.getByText('dialogs.aboutTwine.codeRepo').getAttribute('href')
		).toBe('https://github.com/klembot/twinejs');
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
