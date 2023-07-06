import * as React from 'react';
import {axe} from 'jest-axe';
import {createEvent, fireEvent, render, screen} from '@testing-library/react';
import {IconButton, IconButtonProps} from '../icon-button';

describe('<IconButton>', () => {
	function renderComponent(props?: Partial<IconButtonProps>) {
		return render(
			<IconButton
				icon={<span data-testid="mock-icon" />}
				label="mock-label"
				{...props}
			/>
		);
	}

	it('renders the icon prop', () => {
		renderComponent();
		expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
	});

	it('renders the label prop', () => {
		renderComponent();
		expect(screen.getByText('mock-label')).toBeInTheDocument();
	});

	it('renders the displayLabel prop instead of the label prop if set', () => {
		renderComponent({displayLabel: <div data-testid="mock-display-label" />});
		expect(screen.getByTestId('mock-display-label')).toBeInTheDocument();
		expect(screen.queryByText('mock-label')).not.toBeInTheDocument();
	});

	it('labels the button using the label prop when it is icon-only', () => {
		renderComponent({
			displayLabel: <div data-testid="mock-display-label" />,
			iconOnly: true
		});
		expect(
			screen.getByRole('button', {name: 'mock-label'})
		).toBeInTheDocument();
	});

	it('disables the button if the disabled prop is set', async () => {
		const {unmount} = renderComponent({disabled: true});

		expect(screen.getByRole('button')).toHaveAttribute('disabled');
		unmount();
		renderComponent({disabled: false});
		expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
	});

	it('calls the onClick prop when the button is clicked', async () => {
		const onClick = jest.fn();

		renderComponent({onClick});
		expect(onClick).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole('button'));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('prevents the default action from taking place if the preventDefault prop is true', () => {
		renderComponent({preventDefault: true});

		const button = screen.getByRole('button');
		const preventedEvent = createEvent.click(button);

		fireEvent(button, preventedEvent);
		expect(preventedEvent.defaultPrevented).toBe(true);
	});

	it('adds an aria-pressed attribute if the selectable prop is true, even if the button is not selected', () => {
		renderComponent({selectable: true});
		expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
	});

	it('adds an aria-pressed attribute if the selectable prop is true and the button is pressed', () => {
		renderComponent({selectable: true, selected: true});
		expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
	});

	it('is accessible', async () => {
		const {container} = render(
			<IconButton icon={<span data-testid="mock-icon" />} label="mock-label" />
		);
		expect(await axe(container)).toHaveNoViolations();
	});
});
