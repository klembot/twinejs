import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	AutocompleteTextInput,
	AutocompleteTextInputProps
} from '../autocomplete-text-input';

function AutocompleteTextInputDemo(
	props: Omit<AutocompleteTextInputProps, 'children' | 'onChange'>
) {
	const [value, setValue] = React.useState(props.value);

	return (
		<AutocompleteTextInput
			completions={props.completions}
			id={props.id}
			onChange={event => setValue(event.target.value)}
			value={value}
		>
			children
		</AutocompleteTextInput>
	);
}

describe('<AutocompleteTextInput>', () => {
	function renderComponent(props?: Partial<AutocompleteTextInputProps>) {
		return render(
			<AutocompleteTextInputDemo
				completions={[]}
				id="test-autocomplete"
				value="mock-value"
				{...props}
			/>
		);
	}

	it('renders a text input with the value set', () => {
		renderComponent({value: 'test-value'});

		const field = screen.getByRole('combobox');

		expect(field).toBeInTheDocument();
		expect(field.getAttribute('value')).toBe('test-value');
	});

	it("allows typing in a value that doesn't match any completions", () => {
		renderComponent({completions: ['test'], value: 'test-value'});

		const field = screen.getByRole('combobox');

		fireEvent.input(field, {
			data: 'a',
			target: {selectionStart: 0, selectionEnd: 0, value: 'a'}
		});
		expect(field).toHaveValue('a');
		fireEvent.input(field, {
			data: 'b',
			target: {selectionStart: 1, selectionEnd: 1, value: 'ab'}
		});
		expect(field).toHaveValue('ab');
		fireEvent.input(field, {
			data: 'c',
			target: {selectionStart: 2, selectionEnd: 2, value: 'abc'}
		});
		expect(field).toHaveValue('abc');
	});

	it('autocompletes the first match when the input changes and the cursor is at the end', () => {
		renderComponent({completions: ['test'], value: ''});

		const field = screen.getByRole('combobox');

		fireEvent.input(field, {
			data: 't',
			target: {selectionStart: 1, selectionEnd: 1, value: 't'}
		});
		expect(field).toHaveValue('test');
		// Selection doesn't seem to be set correctly in our test DOM.
	});

	it('only autocompletes case-sensitive matches', () => {
		renderComponent({completions: ['test'], value: ''});

		const field = screen.getByRole('combobox');

		fireEvent.input(field, {
			data: 'T',
			target: {selectionStart: 1, selectionEnd: 1, value: 'T'}
		});
		expect(field).toHaveValue('T');
	});

	it("doesn't autocomplete if the cursor is not at the end of the field", () => {
		renderComponent({completions: ['test'], value: 'ts'});

		const field = screen.getByRole('combobox');

		fireEvent.input(field, {
			data: 'e',
			target: {selectionStart: 2, selectionEnd: 2, value: 'tes'}
		});
		expect(field).toHaveValue('tes');
	});

	it("doesn't autocomplete if there is text selected", () => {
		renderComponent({completions: ['test'], value: 'te'});

		const field = screen.getByRole('combobox');

		fireEvent.input(field, {
			data: 's',
			target: {selectionStart: 0, selectionEnd: 1, value: 'tes'}
		});
		expect(field).toHaveValue('tes');
	});

	it('renders a datalist with autocomplete', () => {
		renderComponent({completions: ['apple', 'banana', 'cherry']});

		const datalist = document.querySelector('datalist');

		expect(datalist).toBeInTheDocument();
		
		const options = datalist!.querySelectorAll('option');
		expect(options).toHaveLength(3);
		expect(options[0].value).toBe('apple');
		expect(options[1].value).toBe('banana');
		expect(options[2].value).toBe('cherry');
	});

	it('uses the id prop to generate the datalist id', () => {
		renderComponent({id: 'tag-input', completions: ['test']});

		const field = screen.getByRole('combobox');
		const datalist = document.querySelector('#tag-input-datalist');

		expect(field.getAttribute('list')).toBe('tag-input-datalist');
		expect(datalist).toBeInTheDocument();
		expect(datalist?.id).toBe('tag-input-datalist');
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
