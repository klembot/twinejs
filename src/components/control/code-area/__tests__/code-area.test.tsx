import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {CodeArea, CodeAreaProps} from '../code-area';

jest.mock('react-codemirror2');

describe('<CodeArea>', () => {
	function renderComponent(props?: Partial<CodeAreaProps>) {
		return render(
			<CodeArea
				id="mock-id"
				label="mock-label"
				onChangeEditor={jest.fn()}
				onChangeText={jest.fn()}
				value="mock-value"
				{...props}
			/>
		);
	}

	describe('When CodeMirror is enabled', () => {
		it('renders the label prop', () => {
			renderComponent({label: 'test label'});
			expect(screen.getByLabelText('test label')).toBeInTheDocument();
		});

		it('renders the value prop', () => {
			renderComponent({value: 'test value'});
			expect(screen.getByLabelText('mock-label')).toHaveValue('test value');
		});

		it('sets a style on the container based on the fontFamily and fontScale props', () => {
			renderComponent({fontFamily: 'my-custom-font', fontScale: 1.5});

			const inputStyle = window.getComputedStyle(
				// eslint-disable-next-line testing-library/no-node-access
				document.querySelector('.code-area')!
			);

			expect(inputStyle.getPropertyValue('font-family')).toBe('my-custom-font');
			expect(inputStyle.getPropertyValue('font-size')).toBe('150%');
		});

		// Changes are handled by props on react-codemirror2 and not tested here.

		it('is accessible', async () => {
			const {container} = renderComponent();

			expect(await axe(container)).toHaveNoViolations();
		});
	});

	describe('When using a browser native textarea', () => {
		it('renders the label prop', () => {
			renderComponent({label: 'test label', useCodeMirror: false});
			expect(screen.getByLabelText('test label')).toBeInTheDocument();
		});

		it('renders the value prop', () => {
			renderComponent({value: 'test value', useCodeMirror: false});
			expect(screen.getByLabelText('mock-label')).toHaveValue('test value');
		});

		it('sets a style on the container based on the fontFamily and fontScale props', () => {
			renderComponent({
				fontFamily: 'my-custom-font',
				fontScale: 1.5,
				useCodeMirror: false
			});

			const inputStyle = window.getComputedStyle(
				// eslint-disable-next-line testing-library/no-node-access
				document.querySelector('.code-area')!
			);

			expect(inputStyle.getPropertyValue('font-family')).toBe('my-custom-font');
			expect(inputStyle.getPropertyValue('font-size')).toBe('150%');
		});

		it('calls the onChangeText prop when the textarea is changed', () => {
			const onChangeText = jest.fn();

			renderComponent({onChangeText, useCodeMirror: false});
			expect(onChangeText).not.toHaveBeenCalled();
			fireEvent.change(screen.getByLabelText('mock-label'), {
				target: {value: 'change'}
			});
			expect(onChangeText.mock.calls).toEqual([['change']]);
		});

		it('is accessible', async () => {
			const {container} = renderComponent({useCodeMirror: false});

			expect(await axe(container)).toHaveNoViolations();
		});
	});
});
