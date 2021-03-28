import * as React from 'react';
import {LinkConnectorGroup} from './link-connector-group';
import {LinkMarkers} from './markers';
import {Point} from '../../../util/geometry';
import {passageLinks, Passage} from '../../../store/stories';

export interface LinkConnectorsProps {
	offset: Point;
	passages: Passage[];
}

const noOffset: Point = {left: 0, top: 0};

export const LinkConnectors: React.FC<LinkConnectorsProps> = props => {
	const {offset, passages} = props;
	const {draggable, fixed} = React.useMemo(() => passageLinks(passages), [
		passages
	]);

	return (
		<svg className="link-connectors">
			<LinkMarkers />
			<LinkConnectorGroup {...draggable} offset={offset} />
			<LinkConnectorGroup {...fixed} offset={noOffset} />
		</svg>
	);
};
