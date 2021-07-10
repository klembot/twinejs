import * as React from 'react';
import {Passage} from '../../../store/stories';
import {Point} from '../../../util/geometry';
import './broken-connector.css';

export interface BrokenConnectorProps {
	offset: Point;
	passage: Passage;
}

// Making this equal in length to <StartConnector>.
const lineOffset = 25 * Math.sqrt(2);

export const BrokenConnector: React.FC<BrokenConnectorProps> = props => {
	const {offset, passage} = props;
	const start: Point = {left: passage.left, top: passage.top};

	if (passage.selected) {
		start.left += offset.left;
		start.top += offset.top;
	}

	return (
		<line
			className="broken-connector"
			x1={start.left + passage.width}
			y1={start.top + passage.height}
			x2={start.left + passage.width + lineOffset}
			y2={start.top + passage.height + lineOffset}
			style={{markerEnd: 'url(#link-broken)'}}
		/>
	);
};
