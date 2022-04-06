import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {IndentButtons, IndentButtonsProps} from '../indent-buttons';

describe('<IndentButtons>', () => {
	function renderComponent(props?: Partial<IndentButtonsProps>) {
		const mockEditor = {execCommand: jest.fn(), focus: jest.fn()};

		return render(<IndentButtons editor={mockEditor as any} {...props} />);
	}

	it('sends an indentMore command and focuses the editor when the indent button is clicked', () => {
		const editor = {execCommand: jest.fn(), focus: jest.fn()};

		renderComponent({editor: editor as any});
		fireEvent.click(screen.getByText('components.indentButtons.indent'));
		expect(editor.execCommand.mock.calls).toEqual([['indentMore']]);
		expect(editor.focus).toHaveBeenCalledTimes(1);
	});

	it('sends an indentLess command and focuses the editor when the unindent button is clicked', () => {
		const editor = {execCommand: jest.fn(), focus: jest.fn()};

		renderComponent({editor: editor as any});
		fireEvent.click(screen.getByText('components.indentButtons.unindent'));
		expect(editor.execCommand.mock.calls).toEqual([['indentLess']]);
		expect(editor.focus).toHaveBeenCalledTimes(1);
	});

	it('disables both buttons if the editor prop is not defined', () => {
		renderComponent({editor: undefined});
		expect(screen.getByText('components.indentButtons.indent')).toBeDisabled();
		expect(
			screen.getByText('components.indentButtons.unindent')
		).toBeDisabled();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
