import * as React from 'react';
import {Passage} from '../../store/stories';
import {PassageCard, PassageCardProps} from './passage-card';

export interface PassageCardGroupProps
	extends Omit<PassageCardProps, 'passage'> {
	passages: Passage[];
}

export const PassageCardGroup: React.FC<PassageCardGroupProps> = React.memo(
	props => {
		const {passages} = props;
		return (
			<>
				{passages.map(passage => (
					<PassageCard
						key={passage.id}
						passage={passage}
						{...props}
					/>
				))}
			</>
		);
	}
);
