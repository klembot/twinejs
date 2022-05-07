import * as React from 'react';
import 'element-closest';
import {rectFromPoints, Point, Rect} from '../../util/geometry';
import './marquee-selection.css';

export interface MarqueeSelectionProps {
	/**
	 * Container DOM element to attach events to.
	 */
	container: React.RefObject<HTMLElement>;
	/**
	 * Ignores click events on any element matching this selector. This is so that
	 * drags beginning on a passage card can be ignored.
	 */
	ignoreEventsOnSelector?: string;
	/**
	 * Callback for when selection is finalized by the user letting go of the
	 * mouse button.
	 */
	onSelectRect: (rect: Rect, additive: boolean) => void;
	/**
	 * Callback for when the user is altering the selection by dragging the mouse.
	 */
	onTemporarySelectRect: (rect: Rect, additive: boolean) => void;
}

export const MarqueeSelection: React.FC<MarqueeSelectionProps> = props => {
	const {
		container,
		ignoreEventsOnSelector,
		onSelectRect,
		onTemporarySelectRect
	} = props;
	const [additive, setAdditive] = React.useState(false);
	const [dragging, setDragging] = React.useState(false);
	const [start, setStart] = React.useState<Point>();
	const [current, setCurrent] = React.useState<Point>();

	// There are two effects here to prevent unnecesary cleanup of event
	// listeners. One listens to DOM events on the container, the other handles
	// calling onSelectRect.

	React.useEffect(() => {
		const currentContainer = container.current;
		let currentContainerRect: DOMRect;

		function relativePointerPos(event: PointerEvent) {
			return {
				left:
					event.clientX -
					currentContainerRect.left +
					currentContainer!.scrollLeft,
				top:
					event.clientY - currentContainerRect.top + currentContainer!.scrollTop
			};
		}

		function upListener(event: PointerEvent) {
			if (currentContainer) {
				currentContainer.releasePointerCapture(event.pointerId);
				currentContainer.removeEventListener('pointermove', moveListener);
				currentContainer.removeEventListener('pointerup', upListener);
				setDragging(false);
				// See the second effect for how callbacks are invoked.
			}
		}

		function moveListener(event: PointerEvent) {
			setCurrent(relativePointerPos(event));
		}

		function downListener(event: PointerEvent) {
			if (
				event.pointerType === 'touch' ||
				event.button !== 0 ||
				!currentContainer
			) {
				return;
			}

			if (
				ignoreEventsOnSelector &&
				(event.target as HTMLElement).closest(ignoreEventsOnSelector)
			) {
				return;
			}

			currentContainerRect = currentContainer.getBoundingClientRect();
			currentContainer.setPointerCapture(event.pointerId);
			currentContainer.addEventListener('pointermove', moveListener);
			currentContainer.addEventListener('pointerup', upListener);
			setAdditive(!!(event.shiftKey || event.ctrlKey));
			setDragging(true);
			setStart(relativePointerPos(event));
			setCurrent(relativePointerPos(event));
		}

		if (currentContainer) {
			currentContainer.addEventListener('pointerdown', downListener);
			return () =>
				currentContainer.removeEventListener('pointerdown', downListener);
		}
	}, [container, ignoreEventsOnSelector]);

	React.useEffect(() => {
		// This effect will trigger constantly if the on* callbacks aren't memoized
		// outside the component.

		if (start && current) {
			if (dragging) {
				onTemporarySelectRect(rectFromPoints(start, current), additive);
			} else {
				onSelectRect(rectFromPoints(start, current), additive);
				setStart(undefined);
				setCurrent(undefined);
			}
		}
	}, [additive, current, dragging, onSelectRect, onTemporarySelectRect, start]);

	const style = React.useMemo(() => {
		if (!start || !current) {
			return {};
		}

		const rect = rectFromPoints(start, current);

		// This relies on the static dimensions of the div being set at 100x100 in
		// CSS. The point of this is to allow the browser to resize the marquee
		// using GPU only (hopefully), which is more performant than setting bounds
		// directly.

		return {
			transform: `translate(${rect.left}px, ${rect.top}px) scale(${
				rect.width / 100
			}, ${rect.height / 100})`
		};
	}, [current, start]);

	if (!start || !current) {
		return null;
	}

	return <div className="marquee-selection" style={style} />;
};
