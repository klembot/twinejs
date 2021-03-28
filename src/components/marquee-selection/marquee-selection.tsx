import * as React from 'react';
import {deviceType} from 'detect-it';
import 'element-closest';
import {rectFromPoints, Point, Rect} from '../../util/geometry';
import './marquee-selection.css';

function relativeEventPosition(
	event: MouseEvent,
	container: HTMLElement
): Point {
	const containerRect = container.getBoundingClientRect();

	return {
		left: event.clientX - containerRect.left,
		top: event.clientY - containerRect.top
	};
}

export interface MarqueeSelectionProps {
	container: React.RefObject<HTMLElement>;
	ignoreEventsOnSelector?: string;
	onSelectRect: (rect: Rect, additive: boolean) => void;
}

export const MarqueeSelection: React.FC<MarqueeSelectionProps> = props => {
	const {container, ignoreEventsOnSelector, onSelectRect} = props;
	const [selecting, setSelecting] = React.useState(false);
	const [additive, setAdditive] = React.useState(false);
	const [start, setStart] = React.useState<Point>({left: 0, top: 0});
	const [current, setCurrent] = React.useState<Point>({left: 0, top: 0});

	// Listener for the beginning of a selection.

	React.useEffect(() => {
		if (container.current) {
			const currentContainer = container.current;
			const handleMouseDown = (event: MouseEvent) => {
				if (ignoreEventsOnSelector) {
					if (
						(event.target as HTMLElement)?.closest(
							ignoreEventsOnSelector
						)
					) {
						return;
					}
				}

				setAdditive(event.shiftKey || event.ctrlKey);
				setSelecting(true);
				setStart(relativeEventPosition(event, currentContainer));
				setCurrent(relativeEventPosition(event, currentContainer));
				onSelectRect(rectFromPoints(start, current), additive);
			};

			currentContainer.addEventListener('mousedown', handleMouseDown);

			return () =>
				currentContainer.removeEventListener(
					'mousedown',
					handleMouseDown
				);
		}
	}, [
		additive,
		container,
		current,
		ignoreEventsOnSelector,
		onSelectRect,
		start
	]);

	// Listeners while the selection is taking place.

	React.useEffect(() => {
		if (selecting) {
			if (container.current) {
				const currentContainer = container.current;
				const handleMouseMove = (event: MouseEvent) => {
					setCurrent(relativeEventPosition(event, currentContainer));
					onSelectRect(rectFromPoints(start, current), additive);
				};
				const handleMouseUp = () => {
					setSelecting(false);
					cleanUp();
				};
				const cleanUp = () => {
					window.removeEventListener('mousemove', handleMouseMove);
					window.removeEventListener('mouseup', handleMouseUp);
					document.body.classList.remove('marquee-selecting');
				};

				window.addEventListener('mousemove', handleMouseMove);
				window.addEventListener('mouseup', handleMouseUp);
				document.body.classList.add('marquee-selecting');
				return cleanUp;
			}
		}
	}, [additive, container, current, onSelectRect, selecting, start]);

	// This component only works in mouse-enabled environments. It would otherwise
	// block the ability to scroll with a touch.

	if (!selecting || deviceType === 'touchOnly') {
		return null;
	}

	return (
		<div
			className="marquee-selection"
			style={rectFromPoints(start, current)}
		/>
	);
};
