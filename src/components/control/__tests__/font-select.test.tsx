import {fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {FontSelect, FontSelectProps} from '../font-select';

describe('<FontSelect>', () => {
	function renderComponent(props?: Partial<FontSelectProps>) {
		return render(
			<FontSelect
				familyLabel="mock-family-label"
				fontFamily="var(--font-system)"
				fontScale={1}
				onChangeFamily={jest.fn()}
				onChangeScale={jest.fn()}
				scaleLabel="mock-scale-label"
				{...props}
			/>
		);
	}

	it('renders a select of font families', () => {
		renderComponent();

		const familySelect = screen.getByLabelText('mock-family-label');
		const familyOptions = within(familySelect).getAllByRole('option');

		expect(familySelect).toBeInTheDocument();
		expect(familyOptions.length).toBe(3);
		expect(
			within(familySelect).getByText('components.fontSelect.fonts.system')
		).toBeInTheDocument();
		expect(
			within(familySelect).getByText('components.fontSelect.fonts.monospaced')
		).toBeInTheDocument();
		expect(within(familySelect).getByText('common.custom')).toBeInTheDocument();
	});

	it('selects the family set by the fontFamily prop', () => {
		renderComponent({fontFamily: 'var(--font-monospaced)'});
		expect(screen.getByLabelText('mock-family-label')).toHaveValue(
			'var(--font-monospaced)'
		);
	});

	it('calls the onChangeFamily prop when another option is chosen', () => {
		const onChangeFamily = jest.fn();

		renderComponent({onChangeFamily});
		expect(onChangeFamily).not.toHaveBeenCalled();
		fireEvent.change(screen.getByLabelText('mock-family-label'), {
			target: {value: 'var(--font-monospaced)'}
		});
		expect(onChangeFamily.mock.calls).toEqual([['var(--font-monospaced)']]);
	});

	it('does not render a text field for custom font families', () => {
		renderComponent();
		expect(
			screen.queryByText('components.fontSelect.customFamilyDetail')
		).not.toBeInTheDocument();
	});

	it('displays a blank custom family field when changing from a builtin family to a custom one', () => {
		renderComponent({fontFamily: 'var(--font-monospaced)'});
		fireEvent.change(screen.getByLabelText('mock-family-label'), {
			target: {value: 'custom'}
		});
		expect(
			screen.getByLabelText('components.fontSelect.customFamilyDetail')
		).toHaveValue('');
	});

	describe('when a custom font family is set', () => {
		let onChangeFamily: jest.Mock;

		beforeEach(() => {
			onChangeFamily = jest.fn();
			renderComponent({fontFamily: 'mock-font-name', onChangeFamily});
		});

		it('selects the custom option in the select', () =>
			expect(screen.getByLabelText('mock-family-label')).toHaveValue('custom'));

		it('shows a text field with the the custom value', () =>
			expect(
				screen.getByLabelText('components.fontSelect.customFamilyDetail')
			).toHaveValue('mock-font-name'));

		it('calls the onChangeFamily prop when the text field is edited', () => {
			expect(onChangeFamily).not.toHaveBeenCalled();
			fireEvent.change(
				screen.getByLabelText('components.fontSelect.customFamilyDetail'),
				{target: {value: 'changed-font-name'}}
			);
			expect(onChangeFamily.mock.calls).toEqual([['changed-font-name']]);
		});

		it('does not call onChangeFamily if the text field is empty', () => {
			fireEvent.change(
				screen.getByLabelText('components.fontSelect.customFamilyDetail'),
				{target: {value: ''}}
			);
			expect(onChangeFamily).not.toHaveBeenCalled();
		});
	});

	it('renders a select of font scales', () => {
		renderComponent();

		const scaleSelect = screen.getByLabelText('mock-scale-label');
		const scaleOptions = within(scaleSelect).getAllByRole('option');

		expect(scaleSelect).toBeInTheDocument();
		expect(scaleOptions.length).toBe(7);
		expect(within(scaleSelect).getByText('common.custom')).toBeInTheDocument();
	});

	it('selects the current scale set by the fontScale prop', () => {
		renderComponent({fontScale: 1.25});
		expect(screen.getByLabelText('mock-scale-label')).toHaveValue('1.25');
	});

	it('calls the onChangeScale prop when another option is chosen', () => {
		const onChangeScale = jest.fn();

		renderComponent({onChangeScale});
		expect(onChangeScale).not.toHaveBeenCalled();
		fireEvent.change(screen.getByLabelText('mock-scale-label'), {
			target: {value: '1.25'}
		});
		expect(onChangeScale.mock.calls).toEqual([[1.25]]);
	});

	describe('when a custom font scale is set', () => {
		let onChangeScale: jest.Mock;

		beforeEach(() => {
			onChangeScale = jest.fn();
			renderComponent({fontScale: 3, onChangeScale});
		});

		it('selects the custom option in the select', () =>
			expect(screen.getByLabelText('mock-scale-label')).toHaveValue('custom'));

		it('shows a text field showing the custom value as a percentage', () =>
			expect(
				screen.getByLabelText('components.fontSelect.customScaleDetail')
			).toHaveValue('300'));

		it('calls the onChangeScale prop when the text field is edited', () => {
			expect(onChangeScale).not.toHaveBeenCalled();
			fireEvent.change(
				screen.getByLabelText('components.fontSelect.customScaleDetail'),
				{target: {value: '400'}}
			);
			expect(onChangeScale.mock.calls).toEqual([[4]]);
		});

		it('does not call onChangeScale if the text field is not a numeric value', () => {
			fireEvent.change(
				screen.getByLabelText('components.fontSelect.customScaleDetail'),
				{target: {value: 'not a number'}}
			);
			expect(onChangeScale).not.toHaveBeenCalled();
		});
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
