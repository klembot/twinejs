import * as React from 'react';
import {Passage} from '../../../store/stories';
import {Point} from '../../../util/geometry';
import {arc} from '../../../util/svg';
import './self-connector.css';

export interface SelfConnectorProps {
	offset: Point;
	passage: Passage;
}

export const SelfConnector: React.FC<SelfConnectorProps> = props => {
	const {offset, passage} = props;
	const start: Point = {left: passage.left, top: passage.top};

	if (passage.selected) {
		start.left += offset.left;
		start.top += offset.top;
	}

	const radius = React.useMemo(
		() => 0.4 * Math.min(passage.width, passage.height),
		[passage.height, passage.width]
	);

	const path = React.useMemo(
		() =>
			arc({
				start: {
					left: start.left,
					top: start.top + passage.height / 2
				},
				end: {
					left: start.left,
					top: start.top
				},
				radius: {
					left: radius,
					top: radius
				},
				sweep: true,
				largeArc: true
			}),
		[passage.height, radius, start.left, start.top]
	);

	return (
		<path
			className="self-connector"
			d={path}
			style={{markerEnd: 'url(#link-arrowhead)'}}
		/>
	);
};
