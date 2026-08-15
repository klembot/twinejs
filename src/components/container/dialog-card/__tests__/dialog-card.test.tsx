import {fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {FakeStateProvider} from '../../../../test-util';
import {DialogCard, DialogCardProps} from '../dialog-card';

describe('<DialogCard>', () => {
	function renderComponent(props?: Partial<DialogCardProps>) {
		return render(
			<DialogCard
				collapsed={false}
				headerLabel="mock-header-label"
				maximizable={true}
				maximized={false}
				onChangeCollapsed={jest.fn()}
				onChangeHighlighted={jest.fn()}
				onChangeMaximized={jest.fn()}
				onClose={jest.fn()}
				{...props}
			>
				<div data-testid="dialog-card-children" />
			</DialogCard>
		);
	}

	describe('the Escape key', () => {
		function renderWithInput(onClose: () => void) {
			return render(
				<DialogCard
					collapsed={false}
					headerLabel="mock-header-label"
					maximizable
					maximized={false}
					onChangeCollapsed={jest.fn()}
					onChangeHighlighted={jest.fn()}
					onChangeMaximized={jest.fn()}
					onClose={onClose}
				>
					<input type="text" />
				</DialogCard>
			);
		}

		// Escape steps out one level: it leaves the field first, so that there is
		// a way to stop editing without losing the whole dialog.

		it('leaves a focused text field instead of closing', () => {
			const onClose = jest.fn();

			renderWithInput(onClose);

			const input = screen.getByRole('textbox');

			input.focus();
			fireEvent.keyDown(input, {code: 'Escape', key: 'Escape'});
			expect(onClose).not.toHaveBeenCalled();
			expect(document.activeElement).not.toBe(input);
			expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(
				true
			);
		});

		it('closes once focus is out of the field', () => {
			const onClose = jest.fn();

			renderWithInput(onClose);

			const input = screen.getByRole('textbox');

			input.focus();
			fireEvent.keyDown(input, {code: 'Escape', key: 'Escape'});
			fireEvent.keyDown(document.activeElement!, {
				code: 'Escape',
				key: 'Escape'
			});
			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it('closes immediately when nothing is being edited', () => {
			const onClose = jest.fn();

			renderComponent({onClose});
			fireEvent.keyDown(screen.getByRole('dialog'), {
				code: 'Escape',
				key: 'Escape'
			});
			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});

	it('displays the header label', () => {
		renderComponent();
		expect(screen.getByText('mock-header-label')).toBeInTheDocument();
	});

	it('uses the header display label instead of label when provided', () => {
		renderComponent({
			headerDisplayLabel: <div data-testid="mock-header-display-label" />
		});
		expect(screen.getByTestId('mock-header-display-label')).toBeInTheDocument();
		expect(screen.queryByText('mock-header-label')).not.toBeInTheDocument();
	});

	it('shows a maximize button when the maximized prop is true', () => {
		renderComponent({maximizable: true});
		expect(screen.getByLabelText('common.maximize')).toBeInTheDocument();
	});

	it('hides the maximize button when the maximized prop is false', () => {
		renderComponent({maximizable: false});
		expect(screen.queryByLabelText('common.maximize')).not.toBeInTheDocument();
	});

	it('adds a CSS class when highlighted', () => {
		renderComponent({highlighted: true});
		expect(
			document.querySelector('.dialog-card')?.classList.contains('highlighted')
		).toBe(true);
	});

	it("doesn't add a CSS class when unhighlighted", () => {
		renderComponent({highlighted: false});
		expect(
			document.querySelector('.dialog-card')?.classList.contains('highlighted')
		).toBe(false);
	});

	it('adds a CSS class when maximized', () => {
		renderComponent({maximized: true});
		expect(
			document.querySelector('.dialog-card')?.classList.contains('maximized')
		).toBe(true);
	});

	it("doesn't add a CSS class when unmaximized", () => {
		renderComponent({maximized: false});
		expect(
			document.querySelector('.dialog-card')?.classList.contains('maximized')
		).toBe(false);
	});

	it('calls the onChangeMaximized prop with true when the maximize button is clicked', () => {
		const onChangeMaximized = jest.fn();

		renderComponent({onChangeMaximized});
		expect(onChangeMaximized).not.toHaveBeenCalled();
		fireEvent.click(screen.getByLabelText('common.maximize'));
		expect(onChangeMaximized.mock.calls).toEqual([[true]]);
	});

	it('calls the onChangeMaximized prop with false when the unmaximize button is clicked', () => {
		const onChangeMaximized = jest.fn();

		renderComponent({maximized: true, onChangeMaximized});
		expect(onChangeMaximized).not.toHaveBeenCalled();
		fireEvent.click(screen.getByLabelText('common.unmaximize'));
		expect(onChangeMaximized.mock.calls).toEqual([[false]]);
	});

	it('calls the onChangeCollapsed prop when the collapse button is clicked when uncollapsed', () => {
		const onChangeCollapsed = jest.fn();

		renderComponent({onChangeCollapsed});
		expect(onChangeCollapsed).not.toHaveBeenCalled();
		fireEvent.click(screen.getByLabelText('common.collapse'));
		expect(onChangeCollapsed.mock.calls).toEqual([[true]]);
	});

	it('calls the onChangeCollapsed prop when the collpase button is clicked when collapsed', () => {
		const onChangeCollapsed = jest.fn();

		renderComponent({onChangeCollapsed, collapsed: true});
		expect(onChangeCollapsed).not.toHaveBeenCalled();
		fireEvent.click(screen.getByLabelText('common.expand'));
		expect(onChangeCollapsed.mock.calls).toEqual([[false]]);
	});

	it('calls the onClose prop when the close button is clicked', () => {
		const onClose = jest.fn();

		renderComponent({onClose});
		expect(onClose).not.toHaveBeenCalled();
		fireEvent.click(screen.getByLabelText('common.close'));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls the onClose prop when the Escape key is pressed', () => {
		const onClose = jest.fn();

		renderComponent({onClose});
		expect(onClose).not.toHaveBeenCalled();
		fireEvent.keyDown(screen.getByTestId('dialog-card-children'), {
			key: 'Escape',
			code: 'Escape',
			keyCode: 27,
			charCode: 27
		});
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('displays its children when expanded', () => {
		renderComponent({collapsed: false});
		expect(screen.getByTestId('dialog-card-children')).toBeInTheDocument();
	});

	it('does not display children when collapsed', () => {
		renderComponent({collapsed: true});
		expect(
			screen.queryByTestId('dialog-card-children')
		).not.toBeInTheDocument();
	});

	it('shows an error message if its children throw an error', () => {
		jest.spyOn(console, 'error').mockReturnValue();

		const BadComponent = () => {
			throw new Error();
		};

		render(
			<DialogCard
				collapsed={false}
				headerLabel="mock-header-label"
				onChangeCollapsed={jest.fn()}
				onChangeHighlighted={jest.fn()}
				onChangeMaximized={jest.fn()}
				onClose={jest.fn()}
			>
				<BadComponent />
			</DialogCard>
		);
		expect(screen.getByText('mock-header-label')).toBeInTheDocument();
		expect(screen.getByLabelText('common.close')).toBeInTheDocument();
		expect(
			screen.getByText('components.dialogCard.contentsCrashed')
		).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});

	describe('the dialog.maximize command', () => {
		function pressMaximizeKey(target: HTMLElement) {
			target.focus();
			fireEvent.keyDown(target, {altKey: true, code: 'Enter', key: 'Enter'});
		}

		function dialog(
			props?: Partial<DialogCardProps>,
			children?: React.ReactNode
		) {
			return (
				<DialogCard
					collapsed={false}
					headerLabel="mock-header-label"
					maximizable
					maximized={false}
					onChangeCollapsed={jest.fn()}
					onChangeHighlighted={jest.fn()}
					onChangeMaximized={jest.fn()}
					onClose={jest.fn()}
					{...props}
				>
					{children ?? (
						<button type="button">{`${
							props?.headerLabel ?? 'mock'
						}-child`}</button>
					)}
				</DialogCard>
			);
		}

		it('maximizes the dialog when the key is pressed inside it', () => {
			const onChangeMaximized = jest.fn();

			render(
				<FakeStateProvider>{dialog({onChangeMaximized})}</FakeStateProvider>
			);
			pressMaximizeKey(screen.getByText('mock-child'));
			expect(onChangeMaximized.mock.calls).toEqual([[true]]);
		});

		it('restores a maximized dialog when the key is pressed inside it', () => {
			const onChangeMaximized = jest.fn();

			render(
				<FakeStateProvider>
					{dialog({maximized: true, onChangeMaximized})}
				</FakeStateProvider>
			);
			pressMaximizeKey(screen.getByText('mock-child'));
			expect(onChangeMaximized.mock.calls).toEqual([[false]]);
		});

		it('does nothing when the dialog cannot be maximized', () => {
			const onChangeMaximized = jest.fn();

			render(
				<FakeStateProvider>
					{dialog({maximizable: false, onChangeMaximized})}
				</FakeStateProvider>
			);
			pressMaximizeKey(screen.getByText('mock-child'));
			expect(onChangeMaximized).not.toHaveBeenCalled();
		});

		it('only affects the dialog focus is inside of when several are open', () => {
			const focusedOnChangeMaximized = jest.fn();
			const otherOnChangeMaximized = jest.fn();

			render(
				<FakeStateProvider>
					{dialog({
						headerLabel: 'other',
						onChangeMaximized: otherOnChangeMaximized
					})}
					{dialog({
						headerLabel: 'focused',
						onChangeMaximized: focusedOnChangeMaximized
					})}
				</FakeStateProvider>
			);
			pressMaximizeKey(screen.getByText('focused-child'));
			expect(focusedOnChangeMaximized.mock.calls).toEqual([[true]]);
			expect(otherOnChangeMaximized).not.toHaveBeenCalled();
		});

		it('runs while a text field inside the dialog has focus', () => {
			const onChangeMaximized = jest.fn();

			render(
				<FakeStateProvider>
					{dialog({onChangeMaximized}, <input type="text" />)}
				</FakeStateProvider>
			);
			pressMaximizeKey(within(screen.getByRole('dialog')).getByRole('textbox'));
			expect(onChangeMaximized.mock.calls).toEqual([[true]]);
		});
	});
});
