import {act, fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {CardButton, CardButtonProps} from '../card-button';

describe('<CardButton>', () => {
	async function renderComponent(props?: Partial<CardButtonProps>) {
		const result = render(
			<CardButton
				icon="mock-icon"
				label="mock-label"
				onChangeOpen={jest.fn()}
				{...props}
			>
				mock-card-button-child
			</CardButton>
		);

		await act(async () => Promise.resolve());
		return result;
	}

	it('renders the card if the open prop is true', async () => {
		renderComponent({open: true});
		expect(screen.getByText('mock-card-button-child')).toBeInTheDocument();
	});

	it('does not render the card if the open prop is false', async () => {
		renderComponent({open: false});
		expect(
			screen.queryByText('mock-card-button-child')
		).not.toBeInTheDocument();
	});

	it('calls onChangeOpen if the button is clicked when the card is not open', async () => {
		const onChangeOpen = jest.fn();

		renderComponent({onChangeOpen});
		expect(onChangeOpen).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('mock-label'));
		expect(onChangeOpen.mock.calls).toEqual([[true]]);
	});

	it('calls onChangeOpen if the button is clicked when the card is open', async () => {
		const onChangeOpen = jest.fn();

		renderComponent({onChangeOpen, open: true});
		expect(onChangeOpen).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('mock-label'));
		expect(onChangeOpen.mock.calls).toEqual([[false]]);
	});

	// This works in isolation but not with other tests--unsure why.

	it.skip('calls onChangeOpen if the user clicks outside of the card while open', async () => {
		const onChangeOpen = jest.fn();

		renderComponent({onChangeOpen, open: true});
		expect(onChangeOpen).not.toHaveBeenCalled();
		fireEvent.click(document.body);
		expect(onChangeOpen.mock.calls).toEqual([[false]]);
	});

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
