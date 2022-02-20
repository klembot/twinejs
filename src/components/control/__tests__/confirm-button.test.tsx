import {act, fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {ConfirmButton, ConfirmButtonProps} from '../confirm-button';

describe('<ConfirmButton>', () => {
	function renderComponent(props?: Partial<ConfirmButtonProps>) {
		return render(
			<ConfirmButton
				icon={<div data-testid="mock-icon" />}
				label="mock-label"
				onConfirm={jest.fn()}
				prompt="mock-prompt"
				{...props}
			/>
		);
	}

	it('displays the prompt, confirmation, and cancel buttons when the button is clicked', async () => {
		renderComponent({
			cancelLabel: 'test-cancel',
			confirmLabel: 'test-confirm',
			prompt: 'test-prompt'
		});
		fireEvent.click(screen.getByRole('button'));
		await act(() => Promise.resolve());
		expect(
			screen.getByRole('button', {name: 'test-cancel'})
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', {name: 'test-confirm'})
		).toBeInTheDocument();
		expect(screen.getByText('test-prompt')).toBeInTheDocument();
	});

	it('hides confirmation and cancel buttons when the cancel button is clicked', async () => {
		renderComponent({cancelLabel: 'test-cancel', confirmLabel: 'test-confirm'});
		fireEvent.click(screen.getByRole('button'));
		await act(() => Promise.resolve());
		fireEvent.click(screen.getByRole('button', {name: 'test-cancel'}));
		await act(() => Promise.resolve());
		expect(
			screen.queryByRole('button', {name: 'test-cancel'})
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole('button', {name: 'test-confirm'})
		).not.toBeInTheDocument();
	});

	it('hides confirmation and cancel buttons and calls the onConfirm prop when the confirm button is clicked', async () => {
		const onConfirm = jest.fn();

		renderComponent({
			onConfirm,
			confirmLabel: 'test-confirm'
		});
		fireEvent.click(screen.getByRole('button'));
		await act(() => Promise.resolve());
		expect(onConfirm).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole('button', {name: 'test-confirm'}));
		expect(onConfirm).toBeCalledTimes(1);
		expect(
			screen.queryByRole('button', {name: 'test-cancel'})
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole('button', {name: 'test-confirm'})
		).not.toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
