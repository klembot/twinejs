import * as React from 'react';
import {DraggableData} from 'react-draggable';
import {Passage, Story} from '../../../store/stories';
import {boundingRect, Point} from '../../../util/geometry';
import {PassageConnections} from '../passage-connections';
import {PassageCardGroup} from '../passage-card-group';
import './passage-map.css';

export interface PassageMapProps {
	formatName: string;
	formatVersion: string;
	onDeselect: (passage: Passage) => void;
	onDrag: (change: Point) => void;
	onEdit: (passage: Passage) => void;
	onSelect: (passage: Passage, exclusive: boolean) => void;
	passages: Passage[];
	startPassageId: string;
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
	| {type: 'stop'; callback: (change: Point) => void; zoom: number};

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
			//
			// This also must be deferred to avoid changing state mid-render through
			// the callback.

			Promise.resolve().then(() =>
				action.callback({
					left: (state.dragX - state.startX) / action.zoom,
					top: (state.dragY - state.startY) / action.zoom
				})
			);
			return {dragging: false, dragX: 0, dragY: 0, startX: 0, startY: 0};
	}
}

export const PassageMap: React.FC<PassageMapProps> = props => {
	const {
		formatName,
		formatVersion,
		onDeselect,
		onDrag,
		onEdit,
		onSelect,
		passages,
		startPassageId,
		tagColors,
		zoom
	} = props;
	const container = React.useRef<HTMLDivElement>(null);
	const bounds = React.useMemo(() => {
		// Need to inject a fake rect at the very top-left corner to anchor the
		// bounds there.

		const passageBounds = boundingRect([
			...passages,
			{top: 0, left: 0, width: 0, height: 0}
		]);
		const scaledWindowHeight = window.innerHeight / zoom;
		const scaledWindowWidth = window.innerWidth / zoom;

		return {
			height:
				Math.max(passageBounds.height, scaledWindowHeight) +
				window.innerHeight * 0.75,
			width:
				Math.max(passageBounds.width, scaledWindowWidth) +
				window.innerWidth * 0.75
		};
	}, [passages, zoom]);

	const style = React.useMemo(
		() => ({
			...bounds,
			transform: `scale(${zoom})`
		}),
		[bounds, zoom]
	);

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
			`${(state.dragX - state.startX) / zoom}px`
		);
		container.current.style.setProperty(
			'--drag-offset-top',
			`${(state.dragY - state.startY) / zoom}px`
		);
	}, [state.dragX, state.dragY, state.startX, state.startY, zoom]);

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
		dispatch({type: 'stop', callback: onDrag, zoom});
	}, [onDrag, zoom]);

	return (
		<div className="passage-map" ref={container} style={style}>
			<PassageConnections
				formatName={formatName}
				formatVersion={formatVersion}
				offset={{
					left: (state.dragX - state.startX) / zoom,
					top: (state.dragY - state.startY) / zoom
				}}
				passages={passages}
				startPassageId={startPassageId}
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
