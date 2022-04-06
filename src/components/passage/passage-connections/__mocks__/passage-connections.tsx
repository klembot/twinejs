import * as React from 'react';
import {PassageConnectionsProps} from '../passage-connections';

export const PassageConnections: React.FC<PassageConnectionsProps> = ({
	offset,
	passages
}) => (
	<div
		data-testid={`mock-passage-connections-${passages
			.map(p => p.name)
			.join('-')}`}
		data-offset-left={offset.left}
		data-offset-top={offset.top}
	/>
);
