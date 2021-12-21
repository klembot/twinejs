import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	ClickAwayListener,
	ClickAwayListenerProps
} from '../click-away-listener';

describe('<ClickAwayListener>', () => {
	function renderComponent(props?: Partial<ClickAwayListenerProps>) {
		return render(
			<ClickAwayListener onClickAway={jest.fn()} {...props}>
				<div className="ignorable" data-testid="child" />
			</ClickAwayListener>
		);
	}

	it('calls the onClickAway prop when a click occurs on a child', () => {
		const onClickAway = jest.fn();

		renderComponent({onClickAway});
		expect(onClickAway).not.toHaveBeenCalled();
		fireEvent.click(screen.getByTestId('child'));
		expect(onClickAway).toHaveBeenCalledTimes(1);
	});

	it("doesn't call the onClickAway prop when a click occurs on an ignored selector", () => {
		const onClickAway = jest.fn();

		renderComponent({ignoreSelector: '.ignorable', onClickAway});
		expect(onClickAway).not.toHaveBeenCalled();
		fireEvent.click(screen.getByTestId('child'));
		expect(onClickAway).not.toHaveBeenCalled();
	});

	it("doesn't call the onClickAway prop when a click occurs outside it", () => {
		const onClickAway = jest.fn();

		renderComponent({ignoreSelector: '.ignorable', onClickAway});
		expect(onClickAway).not.toHaveBeenCalled();
		fireEvent.click(document.body);
		expect(onClickAway).not.toHaveBeenCalled();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
