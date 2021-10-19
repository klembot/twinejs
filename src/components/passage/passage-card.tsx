import * as React from 'react';
import {DraggableCore, DraggableCoreProps} from 'react-draggable';
import classNames from 'classnames';
import {Card, CardContent} from '../container/card';
import {Passage, TagColors} from '../../store/stories';
import {TagStripe} from '../tag/tag-stripe';
import './passage-card.css';

export interface PassageCardProps {
	onEdit: (passage: Passage) => void;
	onDeselect: (passage: Passage) => void;
	onDragStart?: DraggableCoreProps['onStart'];
	onDrag?: DraggableCoreProps['onDrag'];
	onDragStop?: DraggableCoreProps['onStop'];
	onSelect: (passage: Passage, exclusive: boolean) => void;
	passage: Passage;
	tagColors: TagColors;
	zoom: number;
}

// Needs to fill a large-sized passage card.
const excerptLength = 400;

export const PassageCard: React.FC<PassageCardProps> = React.memo(props => {
	const {
		onDeselect,
		onDrag,
		onDragStart,
		onDragStop,
		onEdit,
		onSelect,
		passage,
		tagColors
	} = props;
	const className = React.useMemo(
		() => classNames('passage-card', {selected: passage.selected}),
		[passage.selected]
	);
	const container = React.useRef<HTMLDivElement>(null);
	const excerpt = React.useMemo(() => passage.text.substr(0, excerptLength), [
		passage.text
	]);
	const style = React.useMemo(
		() => ({
			height: passage.height,
			left: passage.left,
			top: passage.top,
			width: passage.width
		}),
		[passage.height, passage.left, passage.top, passage.width]
	);
	const handleMouseDown = React.useCallback(
		(event: MouseEvent) => {
			// Shift- or control-clicking toggles our selected status, but doesn't
			// affect any other passage's selected status. If the shift or control key
			// was not held down and we were not already selected, we know the user
			// wants to select only this passage.

			if (event.shiftKey || event.ctrlKey) {
				if (passage.selected) {
					onDeselect(passage);
				} else {
					onSelect(passage, false);
				}
			} else if (!passage.selected) {
				onSelect(passage, true);
			}
		},
		[onDeselect, onSelect, passage]
	);
	const handleEdit = React.useCallback(() => onEdit(passage), [
		onEdit,
		passage
	]);

	return (
		<DraggableCore
			nodeRef={container}
			onMouseDown={handleMouseDown}
			onStart={onDragStart}
			onDrag={onDrag}
			onStop={onDragStop}
		>
			<div
				className={className}
				onDoubleClick={handleEdit}
				ref={container}
				style={style}
			>
				<Card highlighted={passage.highlighted} selected={passage.selected}>
					<TagStripe tagColors={tagColors} tags={passage.tags} />
					<h2>{passage.name}</h2>
					<CardContent>{excerpt}</CardContent>
				</Card>
			</div>
		</DraggableCore>
	);
});
