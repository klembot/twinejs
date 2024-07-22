import {cleanup, render} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakePassage} from '../../../../test-util';
import {SelfConnection, SelfConnectionProps} from '../self-connection';

describe('<SelfConnection>', () => {
	function renderComponent(props?: Partial<SelfConnectionProps>) {
		return render(
			<svg>
				<SelfConnection
					offset={{left: 0, top: 0}}
					passage={fakePassage()}
					variant="link"
					{...props}
				/>
			</svg>
		);
	}

	it('renders a <path> element', () => {
		renderComponent();
		expect(document.body.querySelector('path')).toBeInTheDocument();
	});

	it('offsets the path by the offset prop if the passage is selected', () => {
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

	it("doesn't offset the path if the passage is not selected", () => {
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
