import {fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {ColorSelect, ColorSelectProps} from '../color-select';

describe('<ColorSelect>', () => {
	function renderComponent(props?: Partial<ColorSelectProps>) {
		return render(
			<ColorSelect
				label="mock-label"
				onChange={jest.fn()}
				value="red"
				{...props}
			/>
		);
	}

	it('renders a select of colors', () => {
		renderComponent();

		const options = screen.queryAllByRole('option');
		const select = screen.getByRole('combobox');

		expect(options.length).toBe(7);
		expect(within(select).getByText('colors.red')).toBeInTheDocument();
		expect(within(select).getByText('colors.red')).toBeInTheDocument();
		expect(within(select).getByText('colors.yellow')).toBeInTheDocument();
		expect(within(select).getByText('colors.green')).toBeInTheDocument();
		expect(within(select).getByText('colors.blue')).toBeInTheDocument();
		expect(within(select).getByText('colors.purple')).toBeInTheDocument();
		expect(within(select).getByText('colors.none')).toBeInTheDocument();
	});

	it('selects the color set in the value prop', () => {
		renderComponent({value: 'green'});
		expect(screen.getByRole('combobox')).toHaveValue('green');
	});

	it('calls onChange when a color is chosen', () => {
		const onChange = jest.fn();

		renderComponent({onChange});
		expect(onChange).not.toHaveBeenCalled();
		fireEvent.change(screen.getByRole('combobox'), {
			target: {value: 'green'}
		});
		expect(onChange).toBeCalledTimes(1);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
