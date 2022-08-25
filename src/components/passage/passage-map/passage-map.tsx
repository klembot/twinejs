import * as React from 'react';
import {DraggableData} from 'react-draggable';
import {Passage, Story} from '../../../store/stories';
import {boundingRect, Point} from '../../../util/geometry';
import {PassageConnections} from '../passage-connections';
import {PassageCardGroup} from '../passage-card-group';
import './passage-map.css';
import classnames from 'classnames';

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
	visibleZoom: number;
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
			//
			// This also must be deferred to avoid changing state mid-render through
			// the callback.

			Promise.resolve().then(() =>
				action.callback({
					left: state.dragX - state.startX,
					top: state.dragY - state.startY
				})
			);
			return {dragging: false, dragX: 0, dragY: 0, startX: 0, startY: 0};
	}
}

const compactCardZoom = 0.6;

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
		visibleZoom,
		zoom
	} = props;
	const [compactCards, setCompactCards] = React.useState(
		visibleZoom <= compactCardZoom
	);
	const container = React.useRef<HTMLDivElement>(null);
	const passageBounds = React.useMemo(() => {
		// Need to inject a fake rect at the very top-left corner to anchor the
		// bounds there.

		return boundingRect([...passages, {top: 0, left: 0, width: 0, height: 0}]);
	}, [passages]);

	// This is a separate memo so that there's less work when visibleZoom changes
	// during a zoom transition. The max() expression ensures that dialogs will
	// never overlap it--800px is the largest user-selectable dialog width (see
	// dialogs/app-prefs.tsx), so we leave 200px padding around that. We hardcode
	// it here instead of taking a prop mainly for simplicity's sake.

	const style = React.useMemo(() => {
		return {
			height: `calc(${passageBounds.height}px + max(50vh, ${
				1000 / visibleZoom
			}px))`,
			width: `calc(${passageBounds.width}px + max(50vw, ${
				1000 / visibleZoom
			}px))`,
			transform: `scale(${visibleZoom})`
		};
	}, [passageBounds.height, passageBounds.width, visibleZoom]);

	const [state, dispatch] = React.useReducer(dragReducer, {
		dragging: false,
		dragX: 0,
		dragY: 0,
		startX: 0,
		startY: 0
	});

	// Only update the compact card state when visibleZoom and zoom are the same.
	// This avoids re-rendering the cards in the middle of a zoom transition
	// (which causes jank).

	React.useEffect(() => {
		if (zoom === visibleZoom) {
			setCompactCards(zoom <= compactCardZoom);
		}
	}, [visibleZoom, zoom]);

	// Set CSS variables on the container for drag offsets.

	React.useEffect(() => {
		if (!container.current) {
			return;
		}

		container.current.style.setProperty(
			'--drag-offset-left',
			`${(state.dragX - state.startX) / visibleZoom}px`
		);
		container.current.style.setProperty(
			'--drag-offset-top',
			`${(state.dragY - state.startY) / visibleZoom}px`
		);
	}, [state.dragX, state.dragY, state.startX, state.startY, visibleZoom]);

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
		// We use a timeout to delay this execution until after the click handler on
		// <SelectableCard> runs and triggers handleSelect below, so that function
		// can see that a drag has just finished (and should be ignored as part of
		// the drag interaction).
		//
		// Promise.resolve() doesn't appear to give us the timing we need.

		window.setTimeout(() => {
			document.body.classList.remove('dragging-passages');
			dispatch({type: 'stop', callback: onDrag});
		}, 0);
	}, [onDrag]);
	const handleSelect = React.useCallback(
		(passage: Passage, exclusive: boolean) => {
			// See comments in handleDragStop above.

			if (!state.dragging) {
				onSelect(passage, exclusive);
			}
		},
		[onSelect, state.dragging]
	);

	return (
		<div
			className={classnames('passage-map', {
				'compact-passage-cards': compactCards
			})}
			ref={container}
			style={style}
		>
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
				onSelect={handleSelect}
				passages={passages}
				tagColors={tagColors}
			/>
		</div>
	);
};
