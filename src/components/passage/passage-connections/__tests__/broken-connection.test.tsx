import {cleanup, render} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakePassage} from '../../../../test-util';
import {BrokenConnection, BrokenConnectionProps} from '../broken-connection';

describe('<BrokenConnection>', () => {
	function renderComponent(props?: Partial<BrokenConnectionProps>) {
		return render(
			<svg>
				<BrokenConnection
					offset={{left: 0, top: 0}}
					passage={fakePassage()}
					{...props}
				/>
			</svg>
		);
	}

	it('renders a <line> element', () => {
		renderComponent();
		expect(document.body.querySelector('line')).toBeInTheDocument();
	});

	it('offsets the line by the offset prop if the passage is selected', () => {
		renderComponent({
			offset: {left: 10, top: 20},
			passage: fakePassage({left: 5, top: 10, selected: false})
		});

		const unselected = document.body.innerHTML;

		cleanup();
		renderComponent({
			offset: {left: 10, top: 20},
			passage: fakePassage({left: 5, top: 10, selected: true})
		});

		const selected = document.body.innerHTML;

		expect(unselected).not.toBe(selected);
	});

	it("doesn't offset the line if the passage is not selected", () => {
		renderComponent({
			offset: {left: 10, top: 20},
			passage: fakePassage({left: 5, top: 10, selected: false})
		});

		const unselected = document.body.innerHTML;

		cleanup();
		renderComponent({
			offset: {left: 0, top: 0},
			passage: fakePassage({left: 5, top: 10, selected: true})
		});

		const selected = document.body.innerHTML;

		expect(unselected).toBe(selected);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
