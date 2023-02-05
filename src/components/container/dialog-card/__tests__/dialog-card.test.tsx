import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
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
				onChangeMaximized={jest.fn()}
				onClose={jest.fn()}
				{...props}
			>
				<div data-testid="dialog-card-children" />
			</DialogCard>
		);
	}

	it('calls the onChangeCollapsed prop when the header button is clicked when uncollapsed', () => {
		const onChangeCollapsed = jest.fn();

		renderComponent({onChangeCollapsed, headerLabel: 'test-label'});
		expect(onChangeCollapsed).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('test-label'));
		expect(onChangeCollapsed.mock.calls).toEqual([[true]]);
	});

	it('calls the onChangeCollapsed prop when the header button is clicked when collapsed', () => {
		const onChangeCollapsed = jest.fn();

		renderComponent({
			collapsed: true,
			onChangeCollapsed,
			headerLabel: 'test-label'
		});
		expect(onChangeCollapsed).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('test-label'));
		expect(onChangeCollapsed.mock.calls).toEqual([[false]]);
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
});
