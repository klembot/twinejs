import * as React from 'react';
import {Passage} from '../../../store/stories';
import {BrokenConnector} from './broken-connector';
import {PassageConnector} from './passage-connector';
import {SelfConnector} from './self-connector';
import {Point} from '../../../util/geometry';

export interface LinkConnectorGroupProps {
	brokenLinks: Set<Passage>;
	links: Map<Passage, Set<Passage>>;
	offset: Point;
	selfLinks: Set<Passage>;
}

export const LinkConnectorGroup: React.FC<LinkConnectorGroupProps> = React.memo(
	props => {
		const {brokenLinks, links, offset, selfLinks} = props;

		return (
			<>
				{Array.from(links).map(link =>
					Array.from(link[1]).map(end => (
						<PassageConnector
							end={end}
							offset={offset}
							key={link[0].name + end.name}
							start={link[0]}
						/>
					))
				)}
				{Array.from(selfLinks).map(passage => (
					<SelfConnector
						key={passage.name}
						offset={offset}
						passage={passage}
					/>
				))}
				{Array.from(brokenLinks).map(passage => (
					<BrokenConnector
						key={passage.name}
						offset={offset}
						passage={passage}
					/>
				))}
			</>
		);
	}
);
