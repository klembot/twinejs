import * as React from 'react';
import {axe} from 'jest-axe';
import {FileInput, FileInputProps} from '../file-input';
import {render, screen} from '@testing-library/react';

describe('<FileInput>', () => {
	function renderComponent(props?: Partial<FileInputProps>) {
		return render(
			<FileInput onChange={jest.fn()} {...props}>
				mock-label
			</FileInput>
		);
	}

	it('renders a file input with the file types specified by the prop', () => {
		renderComponent({accept: 'text/plain'});

		const input = screen.getByLabelText('mock-label');

		expect(input).toBeInTheDocument();
	});

	// These will require mocking of the FileReader class.

	it.todo('calls the onChange prop when the input is changed');
	it.todo(
		'calls the onError prop when the input is changed and the file fails to be read'
	);

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
