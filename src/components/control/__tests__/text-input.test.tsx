import * as React from 'react';
import {axe} from 'jest-axe';
import {fireEvent, render, screen} from '@testing-library/react';
import {TextInput, TextInputProps} from '../text-input';

describe('<TextInput>', () => {
	function renderComponent(props?: Partial<TextInputProps>) {
		return render(
			<TextInput onChange={jest.fn()} value="mock-value" {...props}>
				children
			</TextInput>
		);
	}

	it('renders a text input with the value set', () => {
		renderComponent({value: 'test-value'});

		const field = screen.getByRole('textbox');

		expect(field).toBeInTheDocument();
		expect(field.getAttribute('value')).toBe('test-value');
	});

	it('renders a text input with the placeholder attribute', () => {
		renderComponent({placeholder: 'test-placeholder'});

		const field = screen.getByRole('textbox');

		expect(field).toBeInTheDocument();
		expect(field.getAttribute('placeholder')).toBe('test-placeholder');
	});

	it('allows its type to be changed via prop', () => {
		renderComponent({type: 'search'});

		const field = screen.getByRole('searchbox');

		expect(field).toBeInTheDocument();
		expect(field.getAttribute('type')).toBe('search');
	});

	it('defaults to a text type input', () => {
		renderComponent({placeholder: 'test-placeholder'});

		const field = screen.getByRole('textbox');

		expect(field).toBeInTheDocument();
		expect(field.getAttribute('type')).toBe('text');
	});

	it('calls the onChange prop when the input receives a change event', () => {
		const onChange = jest.fn();

		renderComponent({onChange});
		expect(onChange).toHaveBeenCalledTimes(0);
		fireEvent.change(screen.getByRole('textbox'), {target: {value: ''}});
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it('calls the onInput prop when the input receives an input event', () => {
		const onInput = jest.fn();

		renderComponent({onInput});
		expect(onInput).toHaveBeenCalledTimes(0);
		fireEvent.input(screen.getByRole('textbox'));
		expect(onInput).toHaveBeenCalledTimes(1);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		// Turn off contrast checks here because jsdom doesn't support computed
		// style.
		// See https://github.com/nickcolley/jest-axe/issues/147

		expect(
			await axe(container, {rules: {'color-contrast': {enabled: false}}})
		).toHaveNoViolations();
	});
});
