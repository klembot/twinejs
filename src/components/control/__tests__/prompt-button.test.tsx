import {faker} from '@faker-js/faker';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {PromptButton, PromptButtonProps} from '../prompt-button';

describe('<PromptButton>', () => {
	function renderComponent(props?: Partial<PromptButtonProps>) {
		return render(
			<PromptButton
				onChange={jest.fn()}
				onSubmit={jest.fn()}
				prompt={faker.lorem.words(10)}
				value={faker.lorem.words(1)}
				icon={<div data-testid="icon" />}
				label={faker.lorem.words(1)}
				{...props}
			/>
		);
	}

	function validate(value: string) {
		if (value === 'bad') {
			return {valid: false, message: 'mock-validation-error'};
		}

		return {valid: true};
	}

	it('displays the prompt, field, submit and cancel buttons when the button is clicked', async () => {
		renderComponent({
			cancelLabel: 'test-cancel',
			prompt: 'test-prompt',
			submitLabel: 'test-submit'
		});
		fireEvent.click(screen.getByRole('button'));
		await act(() => Promise.resolve());
		expect(
			screen.getByRole('textbox', {name: 'test-prompt'})
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', {name: 'test-cancel'})
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', {name: 'test-submit'})
		).toBeInTheDocument();
	});

	it('hides the prompt, field, submit and cancel buttons when the cancel button is clicked', async () => {
		renderComponent({
			cancelLabel: 'test-cancel',
			prompt: 'test-prompt',
			submitLabel: 'test-submit'
		});
		fireEvent.click(screen.getByRole('button'));
		await act(() => Promise.resolve());
		fireEvent.click(screen.getByRole('button', {name: 'test-cancel'}));
		await act(() => Promise.resolve());
		expect(
			screen.queryByRole('textbox', {name: 'test-prompt'})
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole('button', {name: 'test-cancel'})
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole('button', {name: 'test-submit'})
		).not.toBeInTheDocument();
	});

	it('does not call the onSubmit prop when the submit button is clicked', async () => {
		const onSubmit = jest.fn();

		renderComponent({
			onSubmit,
			cancelLabel: 'test-cancel',
			prompt: 'test-prompt',
			submitLabel: 'test-submit'
		});
		fireEvent.click(screen.getByRole('button'));
		await act(() => Promise.resolve());
		fireEvent.click(screen.getByRole('button', {name: 'test-cancel'}));
		await act(() => Promise.resolve());
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('hides the prompt, field, submit and cancel buttons and calls the onSubmit prop when the submit button is clicked', async () => {
		const onSubmit = jest.fn();
		const value = faker.lorem.words(3);

		renderComponent({
			onSubmit,
			value,
			cancelLabel: 'test-cancel',
			prompt: 'test-prompt',
			submitLabel: 'test-submit'
		});
		expect(onSubmit).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole('button'));
		await act(() => Promise.resolve());
		expect(onSubmit).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole('button', {name: 'test-submit'}));
		await act(() => Promise.resolve());
		expect(
			screen.queryByRole('textbox', {name: 'test-prompt'})
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole('button', {name: 'test-cancel'})
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole('button', {name: 'test-submit'})
		).not.toBeInTheDocument();
		expect(onSubmit).toHaveBeenCalledWith(value);
	});

	it('calls the onChange prop when the text field is changed', async () => {
		const onChange = jest.fn();

		renderComponent({onChange, prompt: 'test-prompt', value: 'old'});
		fireEvent.click(screen.getByRole('button'));
		await act(() => Promise.resolve());
		fireEvent.change(screen.getByRole('textbox', {name: 'test-prompt'}), {
			target: {value: 'green'}
		});
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it.each(['change', 'submit'])(
		'prevents submission if the validate prop blocks it when the validateOn prop is "%s"',
		async validateOn => {
			const onSubmit = jest.fn();

			renderComponent({
				onSubmit,
				validate,
				validateOn: validateOn as 'change' | 'submit',
				prompt: 'test-prompt',
				submitLabel: 'test-submit',
				value: 'bad'
			});
			fireEvent.click(screen.getByRole('button'));

			if (validateOn === 'change') {
				// The button won't disable itself right away if we're validating on submit.

				await waitFor(() =>
					expect(
						screen.getByRole('button', {name: 'test-submit'})
					).toBeDisabled()
				);
			}
			fireEvent.submit(screen.getByRole('textbox', {name: 'test-prompt'}));

			if (validateOn === 'submit') {
				// ... but should now be disabled if we're validating on submit.

				expect(
					screen.getByRole('button', {name: 'test-submit'})
				).toBeDisabled();
			}
			expect(onSubmit).not.toHaveBeenCalled();
		}
	);

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
