import * as React from 'react';
import {LinkConnectorGroup} from './link-connector-group';
import {LinkMarkers} from './markers';
import {Point} from '../../../util/geometry';
import {StartConnector} from './start-connector';
import {passageLinks, Passage} from '../../../store/stories';

export interface LinkConnectorsProps {
	offset: Point;
	passages: Passage[];
	startPassageId: string;
}

const noOffset: Point = {left: 0, top: 0};

export const LinkConnectors: React.FC<LinkConnectorsProps> = props => {
	const {offset, passages, startPassageId} = props;
	const {draggable, fixed} = React.useMemo(() => passageLinks(passages), [
		passages
	]);
	const startPassage = React.useMemo(
		() => passages.find(passage => passage.id === startPassageId),
		[passages, startPassageId]
	);

	return (
		<svg className="link-connectors">
			<LinkMarkers />
			{startPassage && (
				<StartConnector offset={offset} passage={startPassage} />
			)}
			<LinkConnectorGroup {...draggable} offset={offset} />
			<LinkConnectorGroup {...fixed} offset={noOffset} />
		</svg>
	);
};
