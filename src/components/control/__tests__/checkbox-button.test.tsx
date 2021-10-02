import * as React from 'react';
import {axe} from 'jest-axe';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {CheckboxButton, CheckboxButtonProps} from '../checkbox-button';

describe('<CheckboxButton>', () => {
	function renderComponent(props?: Partial<CheckboxButtonProps>) {
		return render(
			<CheckboxButton
				label="mock-label"
				onChange={jest.fn()}
				value={false}
				{...props}
			/>
		);
	}

	it('renders a control with checkbox ARIA role', () => {
		renderComponent();
		expect(screen.getByRole('checkbox')).toBeInTheDocument();
	});

	it('sets the checked state based on the value prop', () => {
		renderComponent({value: false});
		expect(screen.getByRole('checkbox')).not.toBeChecked();
		cleanup();
		renderComponent({value: true});
		expect(screen.getByRole('checkbox')).toBeChecked();
	});

	it('sets the icon based on the value prop', () => {
		renderComponent({
			checkedIcon: 'mock-checked-icon',
			uncheckedIcon: 'mock-unchecked-icon',
			value: false
		});
		expect(screen.getByText('mock-unchecked-icon')).toBeInTheDocument();
		cleanup();
		renderComponent({
			checkedIcon: 'mock-checked-icon',
			uncheckedIcon: 'mock-unchecked-icon',
			value: true
		});
		expect(screen.getByText('mock-checked-icon')).toBeInTheDocument();
	});

	it('calls onChange when the value of the checkbox changes', () => {
		const onChange = jest.fn();

		renderComponent({onChange});
		expect(onChange).toHaveBeenCalledTimes(0);
		fireEvent.click(screen.getByRole('checkbox').querySelector('button')!);
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
