import {render} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {LinkMarkers} from '../link-markers';

describe('<LinkMarkers>', () => {
	function renderComponent() {
		return render(
			<svg>
				<LinkMarkers />
			</svg>
		);
	}

	it('renders a <defs> element', () => {
		renderComponent();
		expect(document.body.querySelector('defs')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
