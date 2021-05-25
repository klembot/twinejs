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
		left: event.clientX - containerRect.left + container.scrollLeft,
		top: event.clientY - containerRect.top + container.scrollTop
	};
}

type MarqueeState =
	| {selecting: false}
	| {selecting: true; exclusive: boolean; start: Point; current: Point};

type MarqueeAction =
	| {
			type: 'startSelection';
			start: Point;
			exclusive: boolean;
	  }
	| {
			type: 'changeSelection';
			current: Point;
	  }
	| {type: 'endSelection'};

function marqueeReducer(
	state: MarqueeState,
	action: MarqueeAction
): MarqueeState {
	// The side effect with onSelectRect is not best practice, but it avoids
	// having to add a useEffect() in the component.

	switch (action.type) {
		case 'startSelection':
			return {
				selecting: true,
				exclusive: action.exclusive,
				start: action.start,
				current: action.start
			};

		case 'changeSelection':
			if (!state.selecting) {
				console.warn(
					'Marquee reducer received a changeSelection action, but it is not currently selecting; ignoring'
				);
				return state;
			}
			return {...state, current: action.current};

		case 'endSelection':
			return {selecting: false};
	}
}

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
	 * Callback for when selection occurs.
	 */
	onSelectRect: (rect: Rect, additive: boolean) => void;
}

export const MarqueeSelection: React.FC<MarqueeSelectionProps> = props => {
	const {container, ignoreEventsOnSelector, onSelectRect} = props;
	const [state, dispatch] = React.useReducer(marqueeReducer, {
		selecting: false
	});

	// Listener for the beginning of a selection.

	React.useEffect(() => {
		// This component only works in mouse-enabled environments. It would otherwise
		// block the ability to scroll with a touch.

		if (deviceType === 'touchOnly') {
			return;
		}

		if (container.current) {
			const currentContainer = container.current;
			const handleMouseDown = (event: MouseEvent) => {
				if (ignoreEventsOnSelector) {
					if ((event.target as HTMLElement)?.closest(ignoreEventsOnSelector)) {
						return;
					}
				}

				const exclusive = !event.shiftKey && !event.ctrlKey;
				const start = relativeEventPosition(event, currentContainer);

				dispatch({type: 'startSelection', exclusive, start});
				onSelectRect({...start, height: 0, width: 0}, exclusive);
			};

			currentContainer.addEventListener('mousedown', handleMouseDown);

			return () =>
				currentContainer.removeEventListener('mousedown', handleMouseDown);
		}
	}, [container, ignoreEventsOnSelector, onSelectRect]);

	// Listeners while the selection is taking place.

	React.useEffect(() => {
		if (state.selecting && container.current) {
			const currentContainer = container.current;
			const handleMouseMove = (event: MouseEvent) => {
				const current = relativeEventPosition(event, currentContainer);

				dispatch({type: 'changeSelection', current});
				onSelectRect(rectFromPoints(state.start, current), state.exclusive);
			};
			const handleMouseUp = () => {
				dispatch({type: 'endSelection'});
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
	}, [container, onSelectRect, state]);

	if (!state.selecting || deviceType === 'touchOnly') {
		return null;
	}

	return (
		<div
			className="marquee-selection"
			style={rectFromPoints(state.start, state.current)}
		/>
	);
};
