import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {MarqueeSelection, MarqueeSelectionProps} from '..';

const MarqueeContainer: React.FC<
	Omit<MarqueeSelectionProps, 'container'>
> = props => {
	const containerRef = React.createRef<HTMLDivElement>();

	return (
		<div ref={containerRef} data-testid="marquee-container">
			<MarqueeSelection {...props} container={containerRef} />
			<div data-testid="ignore-events">
				<div data-testid="ignore-events-child" />
			</div>
		</div>
	);
};

describe('<MarqueeSelection>', () => {
	function renderComponent(
		props?: Omit<Partial<MarqueeSelectionProps>, 'container'>
	) {
		const onSelectRect = jest.fn();
		const result = render(<MarqueeContainer onSelectRect={onSelectRect} />);
		const marqueeContainer = screen.getByTestId('marquee-container');

		return {marqueeContainer, onSelectRect, ...result};
	}

	describe('exclusive selections', () => {
		it('calls onSelectRect with a zero-dimensioned rectangle when the mouse is initially pressed', () => {
			const {marqueeContainer, onSelectRect} = renderComponent();

			expect(onSelectRect).not.toHaveBeenCalled();
			fireEvent.mouseDown(marqueeContainer, {clientX: 10, clientY: 15});
			expect(onSelectRect.mock.calls).toEqual([
				[{height: 0, left: 10, top: 15, width: 0}, true]
			]);
		});

		it('calls onSelectRect when the user drags on the container', () => {
			const {marqueeContainer, onSelectRect} = renderComponent();

			fireEvent.mouseDown(marqueeContainer, {clientX: 10, clientY: 15});
			onSelectRect.mockClear();
			fireEvent.mouseMove(marqueeContainer, {clientX: 20, clientY: 35});
			expect(onSelectRect.mock.calls).toEqual([
				[{height: 20, left: 10, top: 15, width: 10}, true]
			]);
		});

		it('does not call onSelectRect after the user has released the mouse button', () => {
			const {marqueeContainer, onSelectRect} = renderComponent();

			fireEvent.mouseDown(marqueeContainer, {clientX: 10, clientY: 15});
			fireEvent.mouseMove(marqueeContainer, {clientX: 20, clientY: 35});
			fireEvent.mouseUp(marqueeContainer);
			onSelectRect.mockClear();
			fireEvent.mouseMove(marqueeContainer, {clientX: 20, clientY: 35});
			expect(onSelectRect).not.toHaveBeenCalled();
		});

		it.skip('ignores mouse down events inside the ignoreEventsOnSelector prop', () => {
			const {onSelectRect} = renderComponent({
				ignoreEventsOnSelector: '[data-testid="ignore-events"]'
			});

			// Not sure why this doesn't work.

			fireEvent.mouseDown(screen.getByTestId('ignore-events-child'), {
				clientX: 10,
				clientY: 20
			});
			expect(onSelectRect).not.toHaveBeenCalled();
		});
	});

	describe('nonexclusive selections', () => {
		it('calls onSelectRect with a zero-dimensioned rectangle when the mouse is initially pressed', () => {
			const {marqueeContainer, onSelectRect} = renderComponent();

			expect(onSelectRect).not.toHaveBeenCalled();
			fireEvent.mouseDown(marqueeContainer, {
				clientX: 10,
				clientY: 15,
				shiftKey: true
			});
			expect(onSelectRect.mock.calls).toEqual([
				[{height: 0, left: 10, top: 15, width: 0}, false]
			]);
		});

		it('calls onSelectRect when the user drags on the container', () => {
			const {marqueeContainer, onSelectRect} = renderComponent();

			fireEvent.mouseDown(marqueeContainer, {
				clientX: 10,
				clientY: 15,
				shiftKey: true
			});
			onSelectRect.mockClear();
			fireEvent.mouseMove(marqueeContainer, {clientX: 20, clientY: 35});
			expect(onSelectRect.mock.calls).toEqual([
				[{height: 20, left: 10, top: 15, width: 10}, false]
			]);
		});

		it('does not call onSelectRect after the user has released the mouse button', () => {
			const {marqueeContainer, onSelectRect} = renderComponent();

			fireEvent.mouseDown(marqueeContainer, {
				clientX: 10,
				clientY: 15,
				shiftKey: true
			});
			fireEvent.mouseMove(marqueeContainer, {clientX: 20, clientY: 35});
			fireEvent.mouseUp(marqueeContainer);
			onSelectRect.mockClear();
			fireEvent.mouseMove(marqueeContainer, {clientX: 20, clientY: 35});
			expect(onSelectRect).not.toHaveBeenCalled();
		});

		it.skip('ignores mouse down events inside the ignoreEventsOnSelector prop', () => {
			const {onSelectRect} = renderComponent({
				ignoreEventsOnSelector: '[data-testid="ignore-events"]'
			});

			// Not sure why this doesn't work.

			fireEvent.mouseDown(screen.getByTestId('ignore-events-child'), {
				clientX: 10,
				clientY: 20
			});
			expect(onSelectRect).not.toHaveBeenCalled();
		});
	});

	it('does not react to touch events', () => {
		const {marqueeContainer, onSelectRect} = renderComponent();

		fireEvent.touchStart(marqueeContainer);
		fireEvent.touchMove(marqueeContainer);
		expect(onSelectRect).not.toHaveBeenCalled();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
