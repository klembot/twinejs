import * as React from 'react';
import {Passage} from '../../../store/stories';
import {Point} from '../../../util/geometry';
import './broken-connection.css';

export interface BrokenConnectionProps {
	offset: Point;
	passage: Passage;
}

// Making this equal in length to <StartConnector>.
const lineOffset = 25 * Math.sqrt(2);

export const BrokenConnection: React.FC<BrokenConnectionProps> = props => {
	const {offset, passage} = props;
	const start: Point = {left: passage.left, top: passage.top};

	if (passage.selected) {
		start.left += offset.left;
		start.top += offset.top;
	}

	return (
		<line
			className="broken-connection"
			x1={start.left + passage.width}
			y1={start.top + passage.height}
			x2={start.left + passage.width + lineOffset}
			y2={start.top + passage.height + lineOffset}
			style={{markerEnd: 'url(#link-broken)'}}
		/>
	);
};
