import * as React from 'react';
import {axe} from 'jest-axe';
import {fireEvent, render, screen} from '@testing-library/react';
import {TextSelect, TextSelectProps} from '../text-select';

describe('<TextSelect>', () => {
	function renderComponent(props?: Partial<TextSelectProps>) {
		return render(
			<TextSelect
				onChange={jest.fn()}
				options={[{label: 'mock-label', value: 'mock-value'}]}
				value="mock-value"
				{...props}
			>
				mock-label
			</TextSelect>
		);
	}

	it('renders a select with options as determined by the options prop', () => {
		renderComponent({
			options: [
				{label: 'test-label-1', value: 'test-value-1'},
				{disabled: true, label: 'test-label-2', value: 'test-value-2'}
			]
		});

		const select = screen.getByRole('combobox');

		expect(select).toBeInTheDocument();

		const options = select.querySelectorAll('option');

		expect(options.length).toBe(2);
		expect(options[0].innerHTML).toBe('test-label-1');
		expect(options[0].getAttribute('disabled')).toBe(null);
		expect(options[0].getAttribute('value')).toBe('test-value-1');
		expect(options[1].innerHTML).toBe('test-label-2');
		expect(options[1].getAttribute('disabled')).not.toBe(null);
		expect(options[1].getAttribute('value')).toBe('test-value-2');
	});

	it('sets the value of the select based on the value prop', () => {
		renderComponent({
			options: [
				{label: 'test-label-1', value: 'test-value-1'},
				{label: 'test-label-2', value: 'test-value-2'}
			],
			value: 'test-value-2'
		});

		expect(screen.getByRole('combobox')).toHaveValue('test-value-2');
	});

	it('calls the onChange prop when the select changes', () => {
		const onChange = jest.fn();

		renderComponent({onChange});
		expect(onChange).not.toHaveBeenCalled();
		fireEvent.change(screen.getByRole('combobox'), {
			target: {value: 'test-value-1'}
		});
		expect(onChange).toBeCalledTimes(1);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
