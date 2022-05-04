import * as React from 'react';
import {Passage} from '../../../store/stories';
import {Point} from '../../../util/geometry';
import './start-connection.css';

export interface StartConnectionProps {
	offset: Point;
	passage: Passage;
}

export const StartConnection: React.FC<StartConnectionProps> = React.memo(
	props => {
		const {offset, passage} = props;
		const start: Point = {left: passage.left, top: passage.top};

		if (passage.selected) {
			start.left += offset.left;
			start.top += offset.top;
		}

		return (
			<line
				className="start-connection"
				x1={start.left - 50}
				y1={start.top + passage.height / 2}
				x2={start.left}
				y2={start.top + passage.height / 2}
				style={{markerStart: 'url(#link-start)'}}
			/>
		);
	}
);

StartConnection.displayName = 'StartConnection';