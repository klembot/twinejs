import * as React from 'react';
import {DraggableData} from 'react-draggable';
import {PassageCardGroup} from '../passage-card-group';
import {Passage, Story} from '../../../store/stories';
import {LinkConnectors} from '../../story/link-connectors';
import {Point} from '../../../util/geometry';
import './passage-map.css';

export interface PassageMapProps {
	onDeselect: (passage: Passage) => void;
	onDrag: (change: Point) => void;
	onEdit: (passage: Passage) => void;
	onSelect: (passage: Passage, exclusive: boolean) => void;
	passages: Passage[];
	tagColors: Story['tagColors'];
	zoom: number;
}

interface DragState {
	dragging: boolean;
	dragX: number;
	dragY: number;
	startX: number;
	startY: number;
}

type DragAction =
	| {type: 'start'; x: number; y: number}
	| {type: 'move'; x: number; y: number}
	| {type: 'stop'; callback: (change: Point) => void};

function dragReducer(state: DragState, action: DragAction) {
	switch (action.type) {
		case 'start':
			return {
				dragging: true,
				dragX: action.x,
				dragY: action.y,
				startX: action.x,
				startY: action.y
			};

		case 'move':
			return {...state, dragX: action.x, dragY: action.y};

		case 'stop':
			// This is bad reducer practice, probably—this dispatch causes a side
			// effect. However, it allows us to avoid re-renders as state
			// changes--otherwise state becomes a dependency of the handleDragStop
			// callback below--which have a large performance impact.

			action.callback({
				left: state.dragX - state.startX,
				top: state.dragY - state.startY
			});
			return {dragging: false, dragX: 0, dragY: 0, startX: 0, startY: 0};
	}
}

export const PassageMap: React.FC<PassageMapProps> = props => {
	const {
		onDeselect,
		onDrag,
		onEdit,
		onSelect,
		passages,
		tagColors,
		zoom
	} = props;
	const container = React.useRef<HTMLDivElement>(null);
	const [state, dispatch] = React.useReducer(dragReducer, {
		dragging: false,
		dragX: 0,
		dragY: 0,
		startX: 0,
		startY: 0
	});

	React.useEffect(() => {
		if (!container.current) {
			return;
		}

		container.current.style.setProperty(
			'--drag-offset-left',
			`${state.dragX - state.startX}px`
		);
		container.current.style.setProperty(
			'--drag-offset-top',
			`${state.dragY - state.startY}px`
		);
	}, [state.dragX, state.dragY, state.startX, state.startY]);

	// TODO: can perf be even better?
	// Would using a dynamically-created CSS rule be more efficient than a CSS variable?
	// A: Slightly.

	const handleDragStart = React.useCallback((event, data: DraggableData) => {
		document.body.classList.add('dragging-passages');
		dispatch({type: 'start', x: data.x, y: data.y});
	}, []);
	const handleDrag = React.useCallback(
		(event, data: DraggableData) =>
			dispatch({type: 'move', x: data.x, y: data.y}),
		[]
	);
	const handleDragStop = React.useCallback(() => {
		document.body.classList.remove('dragging-passages');
		dispatch({type: 'stop', callback: onDrag});
	}, [onDrag]);

	return (
		<div
			className="passage-map"
			ref={container}
			style={{transform: `scale(${zoom})`}}
		>
			<LinkConnectors
				offset={{
					left: state.dragX - state.startX,
					top: state.dragY - state.startY
				}}
				passages={passages}
			/>
			<PassageCardGroup
				onDeselect={onDeselect}
				onDragStart={handleDragStart}
				onDrag={handleDrag}
				onDragStop={handleDragStop}
				onEdit={onEdit}
				onSelect={onSelect}
				passages={passages}
				tagColors={tagColors}
				zoom={zoom}
			/>
		</div>
	);
};
