import {act, cleanup, fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Tooltip, TooltipProps} from '../tooltip';

const TestTooltip: React.FC<Omit<TooltipProps, 'anchor'>> = props => {
	const [anchor, setAnchor] = React.useState<HTMLDivElement | null>(null);

	return (
		<>
			<div ref={setAnchor}>anchor</div>
			<Tooltip {...props} anchor={anchor} />
		</>
	);
};

describe('<Tooltip>', () => {
	function renderComponent(props?: Partial<TooltipProps>) {
		return render(<TestTooltip label="mock-tooltip" {...props} />);
	}

	afterEach(() => jest.useRealTimers());

	it('hides the tooltip initially', () => {
		renderComponent();
		expect(screen.queryByText('mock-tooltip')).not.toBeInTheDocument();
	});

	it('displays the tooltip when the user points at the anchor, after a delay', () => {
		jest.useFakeTimers();
		renderComponent();
		fireEvent.pointerEnter(screen.getByText('anchor'));
		expect(screen.queryByText('mock-tooltip')).not.toBeInTheDocument();
		act(() => {
			jest.runAllTimers();
		});
		expect(screen.getByText('mock-tooltip')).toBeInTheDocument();
		cleanup();
	});

	it("doesn't display the tooltip if the user points at the anchor and quickly moves away", () => {
		jest.useFakeTimers();
		renderComponent();
		fireEvent.pointerEnter(screen.getByText('anchor'));
		fireEvent.pointerLeave(screen.getByText('anchor'));
		act(() => {
			jest.runAllTimers();
		});
		expect(screen.queryByText('mock-tooltip')).not.toBeInTheDocument();
		cleanup();
	});

	it('hides the tooltip after the user stops pointing at the anchor', () => {
		jest.useFakeTimers();
		renderComponent();
		fireEvent.pointerEnter(screen.getByText('anchor'));
		act(() => {
			jest.runAllTimers();
		});
		expect(screen.getByText('mock-tooltip')).toBeInTheDocument();
		fireEvent.pointerLeave(screen.getByText('anchor'));
		expect(screen.queryByText('mock-tooltip')).not.toBeInTheDocument();
		cleanup();
	});

	it('hides the tooltip from assistive technology', () => {
		jest.useFakeTimers();
		renderComponent();
		fireEvent.pointerEnter(screen.getByText('anchor'));
		act(() => {
			jest.runAllTimers();
		});
		expect(screen.getByRole('tooltip', {hidden: true})).toHaveAttribute(
			'aria-hidden'
		);
		cleanup();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
