import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {UndoRedoButtons, UndoRedoButtonsProps} from '../undo-redo-buttons';

describe('<UndoRedoButtons>', () => {
	function renderComponent(props?: Partial<UndoRedoButtonsProps>) {
		const mockEditor = {
			execCommand: jest.fn(),
			focus: jest.fn(),
			historySize: () => ({redo: 0, undo: 0})
		};

		return render(
			<UndoRedoButtons editor={mockEditor as any} watch={''} {...props} />
		);
	}

	it('sends an undo command and focuses the editor when the undo button is clicked', () => {
		const editor = {
			execCommand: jest.fn(),
			focus: jest.fn(),
			historySize: () => ({redo: 1, undo: 1})
		};

		renderComponent({editor: editor as any});
		fireEvent.click(screen.getByText('common.undo'));
		expect(editor.execCommand.mock.calls).toEqual([['undo']]);
		expect(editor.focus).toHaveBeenCalledTimes(1);
	});

	it('sends a redo command and focuses the editor when the redo button is clicked', () => {
		const editor = {
			execCommand: jest.fn(),
			focus: jest.fn(),
			historySize: () => ({redo: 1, undo: 1})
		};

		renderComponent({editor: editor as any});
		fireEvent.click(screen.getByText('common.redo'));
		expect(editor.execCommand.mock.calls).toEqual([['redo']]);
		expect(editor.focus).toHaveBeenCalledTimes(1);
	});

	it('disables both buttons if the editor prop is not defined', () => {
		renderComponent({editor: undefined});
		expect(screen.getByText('common.undo')).toBeDisabled();
		expect(screen.getByText('common.redo')).toBeDisabled();
	});

	it('disables the undo button if there is no undo history in the editor', () => {
		const editor = {
			historySize: () => ({redo: 1, undo: 0})
		};

		renderComponent({editor: editor as any});
		expect(screen.getByText('common.undo')).toBeDisabled();
	});

	it('disables the redo button if there is no redo history in the editor', () => {
		const editor = {
			historySize: () => ({redo: 0, undo: 1})
		};

		renderComponent({editor: editor as any});
		expect(screen.getByText('common.redo')).toBeDisabled();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
