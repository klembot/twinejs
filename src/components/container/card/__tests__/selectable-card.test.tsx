import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {SelectableCard, SelectableCardProps} from '../selectable-card';

describe('<SelectableCard>', () => {
	function renderComponent(props?: Partial<SelectableCardProps>) {
		return render(
			<SelectableCard label="mock-label" onSelect={jest.fn()} {...props} />
		);
	}

	it('renders as a button with the label provided', () => {
		renderComponent({label: 'mock label'});
		expect(
			screen.getByRole('button', {name: 'mock label'})
		).toBeInTheDocument();
	});

	it('renders with a false pressed attribute if the card is not selected', () => {
		renderComponent({selected: false});
		expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
	});

	it('renders with a true pressed attribute if the card is selected', () => {
		renderComponent({selected: true});
		expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
	});

	describe('when the card is not selected', () => {
		let onSelect: jest.Mock;

		beforeEach(() => {
			onSelect = jest.fn();
			renderComponent({onSelect, selected: false});
		});

		it('exclusively selects when the card is clicked', () => {
			fireEvent.click(screen.getByRole('button'));
			expect(onSelect.mock.calls).toEqual([[true, true]]);
		});

		it('exclusively selects when the Enter key is pressed in the card', () => {
			fireEvent.keyDown(screen.getByRole('button'), {key: 'Enter'});
			expect(onSelect.mock.calls).toEqual([[true, true]]);
		});

		it('exclusively selects when the space bar is pressed in the card', () => {
			fireEvent.keyDown(screen.getByRole('button'), {key: ' '});
			expect(onSelect.mock.calls).toEqual([[true, true]]);
		});

		it('non-exclusively selects when shift-Enter is pressed in the card', () => {
			fireEvent.keyDown(screen.getByRole('button'), {
				key: 'Enter',
				shiftKey: true
			});
			expect(onSelect.mock.calls).toEqual([[true, false]]);
		});

		it('non-exclusively selects when shift-space is pressed in the card', () => {
			fireEvent.keyDown(screen.getByRole('button'), {
				key: ' ',
				shiftKey: true
			});
			expect(onSelect.mock.calls).toEqual([[true, false]]);
		});

		it('non-exclusively selects when control-Enter is pressed in the card', () => {
			fireEvent.keyDown(screen.getByRole('button'), {
				key: 'Enter',
				ctrlKey: true
			});
			expect(onSelect.mock.calls).toEqual([[true, false]]);
		});

		it('non-exclusively selects when control-space is pressed in the card', () => {
			fireEvent.keyDown(screen.getByRole('button'), {
				key: ' ',
				ctrlKey: true
			});
			expect(onSelect.mock.calls).toEqual([[true, false]]);
		});

		it('non-exclusively selects when the card is clicked with the shift key', () => {
			fireEvent.click(screen.getByRole('button'), {shiftKey: true});
			expect(onSelect.mock.calls).toEqual([[true, false]]);
		});

		it('non-exclusively selects when the card is clicked with the control key', () => {
			fireEvent.click(screen.getByRole('button'), {ctrlKey: true});
			expect(onSelect.mock.calls).toEqual([[true, false]]);
		});
	});

	describe('when the card is selected', () => {
		let onSelect: jest.Mock;

		beforeEach(() => {
			onSelect = jest.fn();
			renderComponent({onSelect, selected: true});
		});

		it('exclusively selects when the card is clicked', () => {
			fireEvent.click(screen.getByRole('button'));
			expect(onSelect.mock.calls).toEqual([[true, true]]);
		});

		it('exclusively selects when the Enter key is pressed in the card', () => {
			fireEvent.keyDown(screen.getByRole('button'), {key: 'Enter'});
			expect(onSelect.mock.calls).toEqual([[true, true]]);
		});

		it('exclusively selects when the space bar is pressed in the card', () => {
			fireEvent.keyDown(screen.getByRole('button'), {key: ' '});
			expect(onSelect.mock.calls).toEqual([[true, true]]);
		});

		it('non-exclusively deselects when shift-Enter is pressed in the card', () => {
			fireEvent.keyDown(screen.getByRole('button'), {
				key: 'Enter',
				shiftKey: true
			});
			expect(onSelect.mock.calls).toEqual([[false, false]]);
		});

		it('non-exclusively deselects when shift-space is pressed in the card', () => {
			fireEvent.keyDown(screen.getByRole('button'), {
				key: ' ',
				shiftKey: true
			});
			expect(onSelect.mock.calls).toEqual([[false, false]]);
		});

		it('non-exclusively deselects when control-Enter is pressed in the card', () => {
			fireEvent.keyDown(screen.getByRole('button'), {
				key: 'Enter',
				ctrlKey: true
			});
			expect(onSelect.mock.calls).toEqual([[false, false]]);
		});

		it('non-exclusively deselects when control-space is pressed in the card', () => {
			fireEvent.keyDown(screen.getByRole('button'), {
				key: ' ',
				ctrlKey: true
			});
			expect(onSelect.mock.calls).toEqual([[false, false]]);
		});

		it('non-exclusively deselects when the card is clicked with the shift key', () => {
			fireEvent.click(screen.getByRole('button'), {shiftKey: true});
			expect(onSelect.mock.calls).toEqual([[false, false]]);
		});

		it('non-exclusively deselects when the card is clicked with the control key', () => {
			fireEvent.click(screen.getByRole('button'), {ctrlKey: true});
			expect(onSelect.mock.calls).toEqual([[false, false]]);
		});
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
