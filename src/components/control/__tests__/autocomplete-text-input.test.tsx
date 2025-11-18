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
			onSelect={props.onSelect}
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

	it('autocompletes when there is exactly one match', () => {
		renderComponent({completions: ['test'], value: ''});

		const field = screen.getByRole('combobox');

		fireEvent.input(field, {
			data: 't',
			target: {selectionStart: 1, selectionEnd: 1, value: 't'}
		});
		expect(field).toHaveValue('test');
		// Selection doesn't seem to be set correctly in our test DOM.
	});

	it('autocompletes with case-insensitive matching', () => {
		renderComponent({completions: ['test'], value: ''});

		const field = screen.getByRole('combobox');

		fireEvent.input(field, {
			data: 'T',
			target: {selectionStart: 1, selectionEnd: 1, value: 'T'}
		});

		expect(field).toHaveValue('test');
	});

	it("doesn't autocomplete when there are multiple matches", () => {
		renderComponent({completions: ['test-1', 'test-2'], value: ''});

		const field = screen.getByRole('combobox');

		fireEvent.input(field, {
			data: 't',
			target: {selectionStart: 1, selectionEnd: 1, value: 't'}
		});

		expect(field).toHaveValue('t');
	});

	it('uses case-insensitive matching for multiple matches', () => {
		renderComponent({completions: ['test-1', 'Test-1'], value: ''});

		const field = screen.getByRole('combobox');

		fireEvent.input(field, {
			data: 't',
			target: {selectionStart: 1, selectionEnd: 1, value: 't'}
		});

		expect(field).toHaveValue('t');
	});

	it('autocompletes when narrowing down from multiple to one match', () => {
		renderComponent({completions: ['test-1', 'test-2'], value: ''});

		const field = screen.getByRole('combobox');

		fireEvent.input(field, {
			data: 't',
			target: {selectionStart: 1, selectionEnd: 1, value: 't'}
		});
		expect(field).toHaveValue('t');

		// Type '1' - now only 'test-1' matches, should autocomplete
		fireEvent.input(field, {
			data: '1',
			target: {selectionStart: 7, selectionEnd: 7, value: 'test-1'}
		});
		expect(field).toHaveValue('test-1');
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
		expect(options[0].value).toBe('apple\u2063');
		expect(options[1].value).toBe('banana\u2063');
		expect(options[2].value).toBe('cherry\u2063');
	});

	it('uses the id prop to generate the datalist id', () => {
		renderComponent({id: 'tag-input', completions: ['test']});

		const field = screen.getByRole('combobox');
		const datalist = document.querySelector('#tag-input-datalist');

		expect(field.getAttribute('list')).toBe('tag-input-datalist');
		expect(datalist).toBeInTheDocument();
		expect(datalist?.id).toBe('tag-input-datalist');
	});

	it('calls onSelect when a datalist option is selected', () => {
		const onSelect = jest.fn();
		renderComponent({
			completions: ['apple', 'banana'],
			onSelect,
			value: ''
		});

		const field = screen.getByRole('combobox');

		fireEvent.input(field, {
			target: {
				selectionStart: 5,
				selectionEnd: 5,
				value: 'apple\u2063'
			}
		});

		expect(onSelect).toHaveBeenCalledWith('apple');
		expect(field).toHaveValue('apple');
	});

	it('does not call onSelect when typing normally', () => {
		const onSelect = jest.fn();
		renderComponent({
			completions: ['apple', 'banana'],
			onSelect,
			value: ''
		});

		const field = screen.getByRole('combobox');

		fireEvent.input(field, {
			data: 'a',
			target: {selectionStart: 1, selectionEnd: 1, value: 'a'}
		});

		expect(onSelect).not.toHaveBeenCalled();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
