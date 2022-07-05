import * as React from 'react';
import {Passage} from '../../../store/stories';
import {BrokenConnection} from './broken-connection';
import {PassageConnection} from './passage-connection';
import {SelfConnection} from './self-connection';
import {Point} from '../../../util/geometry';

export interface PassageConnectionGroupProps {
	broken: Set<Passage>;
	connections: Map<Passage, Set<Passage>>;
	offset: Point;
	self: Set<Passage>;
	variant?: 'link' | 'reference';
}

export const PassageConnectionGroup: React.FC<PassageConnectionGroupProps> = React.memo(
	props => {
		const {broken, connections, offset, self, variant = 'link'} = props;

		return (
			<>
				{Array.from(connections).map(connection =>
					Array.from(connection[1]).map(end => (
						<PassageConnection
							end={end}
							offset={offset}
							key={connection[0].name + end.name}
							start={connection[0]}
							variant={variant}
						/>
					))
				)}
				{Array.from(self).map(passage => (
					<SelfConnection
						key={passage.name}
						offset={offset}
						passage={passage}
						variant={variant}
					/>
				))}
				{Array.from(broken).map(passage => (
					<BrokenConnection
						key={passage.name}
						offset={offset}
						passage={passage}
					/>
				))}
			</>
		);
	}
);

PassageConnectionGroup.displayName = 'PassageConnectionGroup';