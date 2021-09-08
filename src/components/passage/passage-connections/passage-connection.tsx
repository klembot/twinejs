import * as React from 'react';
import {arc} from '../../../util/svg';
import {
	lineAngle,
	lineDistance,
	rectCenter,
	rectIntersectionWithLine,
	Point
} from '../../../util/geometry';
import {Passage} from '../../../store/stories';
import './passage-connection.css';

export interface PassageConnectionProps {
	end: Passage;
	offset: Point;
	start: Passage;
	variant: 'link' | 'reference';
}

export const PassageConnection: React.FC<PassageConnectionProps> = props => {
	const {end, offset, start, variant} = props;
	const path = React.useMemo(() => {
		// If either passage is selected, offset it. We need to take care not to
		// overwrite the passage information.

		let offsetStart = start;
		let offsetEnd = end;

		if (start.selected) {
			offsetStart = {
				...start,
				left: start.left + offset.left,
				top: start.top + offset.top
			};
		}

		if (end.selected) {
			offsetEnd = {
				...end,
				left: end.left + offset.left,
				top: end.top + offset.top
			};
		}

		// Start at the center of both passages.

		let startPoint: Point | null = rectCenter(offsetStart);
		let endPoint: Point | null = rectCenter(offsetEnd);

		// Move both points to where they intersect with the edges of their passages.

		startPoint = rectIntersectionWithLine(offsetStart, startPoint, endPoint);

		if (!startPoint) {
			return '';
		}

		endPoint = rectIntersectionWithLine(offsetEnd, startPoint, endPoint);

		if (!endPoint) {
			return '';
		}

		// Draw a flattened arc, to make it easier to distinguish between links
		// between passages with the same horizontal or vertical position (which
		// would otherwise be overlapping flat lines).
		//
		// The horizontal radius of our arc is proportional to the distance
		// the line will travel.

		const distance = lineDistance(startPoint, endPoint);

		// Rotate the arc so that its underside will always face downward. We cheat
		// vertical lines so that their undersides face right--an aesthetic choice,
		// and so that bidirectional links line up.

		let sweep = startPoint.left < endPoint.left;

		if (startPoint.left === endPoint.left && startPoint.top < endPoint.top) {
			sweep = true;
		}

		const angle = lineAngle(startPoint, endPoint);

		// The Y radius is another aesthetic choice. The lower the ratio, the less
		// curved the lines become.

		return arc({
			start: startPoint,
			end: endPoint,
			radius: {left: distance, top: distance * 0.75},
			rotation: angle,
			sweep
		});
	}, [end, offset.left, offset.top, start]);

	return (
		<path
			d={path}
			className={`passage-connection variant-${variant}`}
			style={{markerEnd: 'url(#link-arrowhead)'}}
		/>
	);
};
