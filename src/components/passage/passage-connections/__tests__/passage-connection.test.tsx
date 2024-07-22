import {cleanup, render} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakePassage} from '../../../../test-util';
import {PassageConnection, PassageConnectionProps} from '../passage-connection';

describe('<SelfConnection>', () => {
	function renderComponent(props?: Partial<PassageConnectionProps>) {
		return render(
			<svg>
				<PassageConnection
					end={fakePassage()}
					offset={{left: 0, top: 0}}
					start={fakePassage()}
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

	it('offsets the path by the offset prop if either passage is selected', () => {
		renderComponent({
			end: fakePassage({left: 1015, top: 1020, selected: false}),
			offset: {left: 10, top: 20},
			start: fakePassage({left: 5, top: 10, selected: false})
		});

		const bothUnselected = document.body.innerHTML;

		cleanup();
		renderComponent({
			end: fakePassage({left: 1015, top: 1020, selected: false}),
			offset: {left: 10, top: 20},
			start: fakePassage({left: 5, top: 10, selected: true})
		});

		const startSelected = document.body.innerHTML;

		cleanup();
		renderComponent({
			end: fakePassage({left: 1015, top: 1020, selected: true}),
			offset: {left: 10, top: 20},
			start: fakePassage({left: 5, top: 10, selected: false})
		});

		const endSelected = document.body.innerHTML;

		cleanup();
		renderComponent({
			end: fakePassage({left: 1015, top: 1020, selected: true}),
			offset: {left: 10, top: 20},
			start: fakePassage({left: 5, top: 10, selected: true})
		});

		const bothSelected = document.body.innerHTML;

		expect(endSelected).not.toBe(bothUnselected);
		expect(startSelected).not.toBe(bothUnselected);
		expect(bothSelected).not.toBe(bothUnselected);
	});

	it("doesn't offset the path by the offset prop if both passage are unselected", () => {
		renderComponent({
			end: fakePassage({left: 1015, top: 1020, selected: false}),
			offset: {left: 10, top: 20},
			start: fakePassage({left: 5, top: 10, selected: false})
		});

		const bothUnselected = document.body.innerHTML;

		cleanup();
		renderComponent({
			end: fakePassage({left: 1015, top: 1020, selected: false}),
			offset: {left: 0, top: 0},
			start: fakePassage({left: 5, top: 10, selected: false})
		});

		const bothSelected = document.body.innerHTML;

		expect(bothUnselected).toBe(bothSelected);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
