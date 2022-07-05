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
		const onTemporarySelectRect = jest.fn();
		const result = render(
			<MarqueeContainer
				ignoreEventsOnSelector="[data-testid='ignore-events']"
				onSelectRect={onSelectRect}
				onTemporarySelectRect={onTemporarySelectRect}
			/>
		);
		const marqueeContainer = screen.getByTestId('marquee-container');

		return {marqueeContainer, onSelectRect, onTemporarySelectRect, ...result};
	}

	describe('exclusive selections', () => {
		it('calls onTemporarySelectRect with a zero-dimensioned rectangle when the mouse is initially pressed', () => {
			const {marqueeContainer, onSelectRect, onTemporarySelectRect} =
				renderComponent();

			expect(onSelectRect).not.toHaveBeenCalled();
			expect(onTemporarySelectRect).not.toHaveBeenCalled();
			fireEvent.pointerDown(
				marqueeContainer,
				new PointerEvent('down', {
					button: 0,
					clientX: 10,
					clientY: 15
				})
			);
			fireEvent.mouseDown(marqueeContainer, {clientX: 10, clientY: 15});
			expect(onSelectRect).not.toHaveBeenCalled();
			expect(onTemporarySelectRect.mock.calls).toEqual([
				[{height: 0, left: 10, top: 15, width: 0}, false]
			]);
		});

		it('calls onTemporarySelectRect when the user drags on the container', () => {
			const {marqueeContainer, onSelectRect, onTemporarySelectRect} =
				renderComponent();

			fireEvent.pointerDown(
				marqueeContainer,
				new PointerEvent('down', {
					button: 0,
					clientX: 10,
					clientY: 15
				})
			);
			onTemporarySelectRect.mockClear();
			fireEvent.pointerMove(
				marqueeContainer,
				new PointerEvent('move', {
					button: 0,
					clientX: 20,
					clientY: 35
				})
			);
			expect(onSelectRect).not.toHaveBeenCalled();
			expect(onTemporarySelectRect.mock.calls).toEqual([
				[{height: 20, left: 10, top: 15, width: 10}, false]
			]);
		});

		it('calls onSelectRect after the user releases the mouse button', () => {
			const {marqueeContainer, onSelectRect} = renderComponent();

			fireEvent.pointerDown(
				marqueeContainer,
				new PointerEvent('down', {
					button: 0,
					clientX: 10,
					clientY: 15
				})
			);
			fireEvent.pointerMove(
				marqueeContainer,
				new PointerEvent('move', {
					button: 0,
					clientX: 20,
					clientY: 35
				})
			);
			fireEvent.pointerUp(
				marqueeContainer,
				new PointerEvent('up', {
					button: 0,
					clientX: 20,
					clientY: 35
				})
			);
			expect(onSelectRect.mock.calls).toEqual([
				[{height: 20, left: 10, top: 15, width: 10}, false]
			]);
		});

		it('does not call onSelectRect when the user moves the mouse after releasing the mouse button', () => {
			const {marqueeContainer, onSelectRect} = renderComponent();

			fireEvent.pointerDown(
				marqueeContainer,
				new PointerEvent('down', {
					button: 0,
					clientX: 10,
					clientY: 15
				})
			);
			fireEvent.pointerMove(
				marqueeContainer,
				new PointerEvent('move', {
					button: 0,
					clientX: 20,
					clientY: 35
				})
			);
			fireEvent.pointerUp(
				marqueeContainer,
				new PointerEvent('up', {
					button: 0,
					clientX: 20,
					clientY: 35
				})
			);
			onSelectRect.mockClear();
			fireEvent.pointerMove(
				marqueeContainer,
				new PointerEvent('move', {
					button: 0,
					clientX: 20,
					clientY: 35
				})
			);
			expect(onSelectRect).not.toHaveBeenCalled();
		});

		it('ignores mouse down events inside the ignoreEventsOnSelector prop', () => {
			const {onSelectRect, onTemporarySelectRect} = renderComponent({
				ignoreEventsOnSelector: '[data-testid="ignore-events"]'
			});

			fireEvent.pointerDown(
				screen.getByTestId('ignore-events-child'),
				new PointerEvent('down', {
					button: 0,
					clientX: 10,
					clientY: 15
				})
			);
			expect(onSelectRect).not.toHaveBeenCalled();
			expect(onTemporarySelectRect).not.toHaveBeenCalled();
		});
	});

	describe('additive selections', () => {
		it('calls onTemporarySelectRect with a zero-dimensioned rectangle when the mouse is initially pressed', () => {
			const {marqueeContainer, onSelectRect, onTemporarySelectRect} =
				renderComponent();

			expect(onSelectRect).not.toHaveBeenCalled();
			expect(onTemporarySelectRect).not.toHaveBeenCalled();
			fireEvent.pointerDown(
				marqueeContainer,
				new PointerEvent('down', {
					button: 0,
					clientX: 10,
					clientY: 15,
					shiftKey: true
				})
			);
			fireEvent.mouseDown(marqueeContainer, {clientX: 10, clientY: 15});
			expect(onSelectRect).not.toHaveBeenCalled();
			expect(onTemporarySelectRect.mock.calls).toEqual([
				[{height: 0, left: 10, top: 15, width: 0}, true]
			]);
		});

		it('calls onTemporarySelectRect when the user drags on the container', () => {
			const {marqueeContainer, onSelectRect, onTemporarySelectRect} =
				renderComponent();

			fireEvent.pointerDown(
				marqueeContainer,
				new PointerEvent('down', {
					button: 0,
					clientX: 10,
					clientY: 15,
					shiftKey: true
				})
			);
			onTemporarySelectRect.mockClear();
			fireEvent.pointerMove(
				marqueeContainer,
				new PointerEvent('move', {
					button: 0,
					clientX: 20,
					clientY: 35,
					shiftKey: true
				})
			);
			expect(onSelectRect).not.toHaveBeenCalled();
			expect(onTemporarySelectRect.mock.calls).toEqual([
				[{height: 20, left: 10, top: 15, width: 10}, true]
			]);
		});

		it('calls onSelectRect after the user releases the mouse button', () => {
			const {marqueeContainer, onSelectRect} = renderComponent();

			fireEvent.pointerDown(
				marqueeContainer,
				new PointerEvent('down', {
					button: 0,
					clientX: 10,
					clientY: 15,
					shiftKey: true
				})
			);
			fireEvent.pointerMove(
				marqueeContainer,
				new PointerEvent('move', {
					button: 0,
					clientX: 20,
					clientY: 35,
					shiftKey: true
				})
			);
			fireEvent.pointerUp(
				marqueeContainer,
				new PointerEvent('up', {
					button: 0,
					clientX: 20,
					clientY: 35,
					shiftKey: true
				})
			);
			expect(onSelectRect.mock.calls).toEqual([
				[{height: 20, left: 10, top: 15, width: 10}, true]
			]);
		});

		it('does not call onSelectRect when the user moves the mouse after releasing the mouse button', () => {
			const {marqueeContainer, onSelectRect} = renderComponent();

			fireEvent.pointerDown(
				marqueeContainer,
				new PointerEvent('down', {
					button: 0,
					clientX: 10,
					clientY: 15,
					shiftKey: true
				})
			);
			fireEvent.pointerMove(
				marqueeContainer,
				new PointerEvent('move', {
					button: 0,
					clientX: 20,
					clientY: 35,
					shiftKey: true
				})
			);
			fireEvent.pointerUp(
				marqueeContainer,
				new PointerEvent('up', {
					button: 0,
					clientX: 20,
					clientY: 35,
					shiftKey: true
				})
			);
			onSelectRect.mockClear();
			fireEvent.pointerMove(
				marqueeContainer,
				new PointerEvent('move', {
					button: 0,
					clientX: 20,
					clientY: 35,
					shiftKey: true
				})
			);
			expect(onSelectRect).not.toHaveBeenCalled();
		});

		it('ignores mouse down events inside the ignoreEventsOnSelector prop', () => {
			const {onSelectRect, onTemporarySelectRect} = renderComponent({
				ignoreEventsOnSelector: '[data-testid="ignore-events"]'
			});

			fireEvent.pointerDown(
				screen.getByTestId('ignore-events-child'),
				new PointerEvent('down', {
					button: 0,
					clientX: 10,
					clientY: 15,
					shiftKey: true
				})
			);
			expect(onSelectRect).not.toHaveBeenCalled();
			expect(onTemporarySelectRect).not.toHaveBeenCalled();
		});
	});

	it('does not react to touch events', () => {
		const {marqueeContainer, onSelectRect, onTemporarySelectRect} =
			renderComponent();

		fireEvent.pointerDown(
			marqueeContainer,
			new PointerEvent('down', {
				clientX: 10,
				clientY: 15,
				pointerType: 'touch'
			})
		);
		fireEvent.pointerMove(
			marqueeContainer,
			new PointerEvent('move', {
				clientX: 20,
				clientY: 35,
				pointerType: 'touch'
			})
		);
		expect(onSelectRect).not.toHaveBeenCalled();
		expect(onTemporarySelectRect).not.toHaveBeenCalled();
	});

	it('does not react to non-left button events', () => {
		const {marqueeContainer, onSelectRect, onTemporarySelectRect} =
			renderComponent();

		fireEvent.pointerDown(
			marqueeContainer,
			new PointerEvent('down', {
				button: 1,
				clientX: 10,
				clientY: 15
			})
		);
		fireEvent.pointerMove(
			marqueeContainer,
			new PointerEvent('move', {
				button: 1,
				clientX: 20,
				clientY: 35,
				pointerType: 'touch'
			})
		);
		expect(onSelectRect).not.toHaveBeenCalled();
		expect(onTemporarySelectRect).not.toHaveBeenCalled();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
