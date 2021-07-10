import * as React from 'react';
import {Passage} from '../../../store/stories';
import {Point} from '../../../util/geometry';
import './start-connector.css';

export interface StartConnectorProps {
	offset: Point;
	passage: Passage;
}

export const StartConnector: React.FC<StartConnectorProps> = React.memo(
	props => {
		const {offset, passage} = props;
		const start: Point = {left: passage.left, top: passage.top};

		if (passage.selected) {
			start.left += offset.left;
			start.top += offset.top;
		}

		return (
			<line
				className="start-connector"
				x1={start.left - 50}
				y1={start.top + passage.height / 2}
				x2={start.left}
				y2={start.top + passage.height / 2}
				style={{markerStart: 'url(#link-start)'}}
			/>
		);
	}
);
