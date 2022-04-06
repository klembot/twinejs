import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {CodeArea, CodeAreaProps} from '../code-area';

jest.mock('react-codemirror2');

describe('<CodeArea>', () => {
	function renderComponent(props?: Partial<CodeAreaProps>) {
		return render(
			<CodeArea
				label="mock-label"
				onBeforeChange={jest.fn()}
				value="mock-value"
				{...props}
			/>
		);
	}

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
