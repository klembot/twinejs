import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	FakeStateProvider,
	StoryInspector,
	UndoControls
} from '../../../../test-util';
import {UndoRedoButtons} from '../undo-redo-buttons';

describe('<UndoRedoButtons>', () => {
	function renderComponent() {
		return render(
			<FakeStateProvider>
				<UndoRedoButtons />
				<UndoControls />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	it('enables the undo button if an undo is available', () => {
		renderComponent();
		fireEvent.click(screen.getByText('undo-controls-create-undo'));
		expect(
			screen.getByRole('button', {name: 'common.undoChange'})
		).toBeEnabled();
	});

	it("disables the undo button if an undo isn't available", () => {
		renderComponent();
		expect(screen.getByRole('button', {name: 'common.undo'})).toBeDisabled();
	});

	it('undoes an action when the undo button is clicked', () => {
		renderComponent();

		const originalName = screen.getByTestId('story-inspector-default').dataset
			.name;

		fireEvent.click(screen.getByText('undo-controls-create-undo'));
		expect(screen.getByTestId('story-inspector-default').dataset.name).toBe(
			'mock-story-rename'
		);
		fireEvent.click(screen.getByRole('button', {name: 'common.undoChange'}));
		expect(screen.getByTestId('story-inspector-default').dataset.name).toBe(
			originalName
		);
	});

	it('enables the redo button if a redo is available', () => {
		renderComponent();
		fireEvent.click(screen.getByText('undo-controls-create-undo'));
		fireEvent.click(screen.getByRole('button', {name: 'common.undoChange'}));
		expect(
			screen.getByRole('button', {name: 'common.redoChange'})
		).toBeEnabled();
	});

	it("disables the redo button if a redo isn't available", () => {
		renderComponent();
		expect(screen.getByRole('button', {name: 'common.redo'})).toBeDisabled();
		fireEvent.click(screen.getByText('undo-controls-create-undo'));
		expect(screen.getByRole('button', {name: 'common.redo'})).toBeDisabled();
	});

	it('redoes an action when the redo button is clicked', () => {
		renderComponent();

		fireEvent.click(screen.getByText('undo-controls-create-undo'));
		expect(screen.getByTestId('story-inspector-default').dataset.name).toBe(
			'mock-story-rename'
		);
		fireEvent.click(screen.getByRole('button', {name: 'common.undoChange'}));
		fireEvent.click(screen.getByRole('button', {name: 'common.redoChange'}));
		expect(screen.getByTestId('story-inspector-default').dataset.name).toBe(
			'mock-story-rename'
		);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
