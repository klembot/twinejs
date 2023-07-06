import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	BackgroundDialogCard,
	BackgroundDialogCardProps
} from '../background-dialog-card';

describe('<BackgroundDialogCard>', () => {
	function renderComponent(props?: Partial<BackgroundDialogCardProps>) {
		return render(
			<BackgroundDialogCard
				headerLabel="mock-header-label"
				onClose={jest.fn()}
				onRaise={jest.fn()}
				{...props}
			>
				<div data-testid="background-dialog-card-children" />
			</BackgroundDialogCard>
		);
	}

	it('displays the header label', () => {
		renderComponent();
		expect(
			screen.getByRole('button', {name: 'mock-header-label'})
		).toBeInTheDocument();
	});

	it('uses the header display label instead of label when provided', () => {
		renderComponent({
			headerDisplayLabel: <div data-testid="mock-header-display-label" />
		});
		expect(screen.getByTestId('mock-header-display-label')).toBeInTheDocument();
		expect(screen.queryByText('mock-header-label')).not.toBeInTheDocument();
	});

	it('displays its children', () => {
		renderComponent();
		expect(
			screen.getByTestId('background-dialog-card-children')
		).toBeInTheDocument();
	});

	it('calls the onClose prop when the close button is clicked', () => {
		const onClose = jest.fn();

		renderComponent({onClose});
		expect(onClose).not.toHaveBeenCalled();
		fireEvent.click(screen.getByLabelText('common.close'));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls the onRaise prop when the header is clicked', () => {
		const onRaise = jest.fn();

		renderComponent({onRaise, headerLabel: 'test-header-label'});
		expect(onRaise).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole('button', {name: 'test-header-label'}));
		expect(onRaise).toHaveBeenCalledTimes(1);
	});

	it('shows an error message if its children throw an error', () => {
		jest.spyOn(console, 'error').mockReturnValue();

		const BadComponent = () => {
			throw new Error();
		};

		render(
			<BackgroundDialogCard
				headerLabel="mock-header-label"
				onClose={jest.fn()}
				onRaise={jest.fn()}
			>
				<BadComponent />
			</BackgroundDialogCard>
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
