import * as React from 'react';
import {Passage} from '../../../store/stories';
import {Point} from '../../../util/geometry';
import {arc} from '../../../util/svg';
import './broken-connector.css';

export interface BrokenConnectorProps {
	offset: Point;
	passage: Passage;
}

export const BrokenConnector: React.FC<BrokenConnectorProps> = props => {
	const {offset, passage} = props;
	const start: Point = {left: passage.left, top: passage.top};

	if (passage.selected) {
		start.left += offset.left;
		start.top += offset.top;
	}

	const path = React.useMemo(
		() =>
			arc({
				start: {
					left: start.left + passage.width,
					top: start.top + passage.height / 2
				},
				end: {
					left: start.left + passage.width * 1.5,
					top: start.top + passage.height
				},
				radius: {
					left: passage.width / 2,
					top: passage.height / 2
				},
				sweep: true
			}),
		[passage.height, passage.width, start.left, start.top]
	);

	return (
		<path
			className="broken-connector"
			d={path}
			style={{markerEnd: 'url(#link-broken)'}}
		/>
	);
};
