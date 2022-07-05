import * as React from 'react';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {Passage} from '../../store/stories';
import {PassageCard, PassageCardProps} from './passage-card';
import '../../styles/animations.css';

export interface PassageCardGroupProps
	extends Omit<PassageCardProps, 'passage'> {
	passages: Passage[];
}

export const PassageCardGroup: React.FC<PassageCardGroupProps> = React.memo(
	props => {
		const {passages} = props;

		// Passages must be sorted so that tabbing around follows a logical pattern.

		const sortedPassages = React.useMemo(
			() =>
				[...passages].sort((a, b) => {
					if (a.top !== b.top) {
						return a.top - b.top;
					}

					return a.left - b.left;
				}),
			[passages]
		);

		return (
			<TransitionGroup component={null}>
				{sortedPassages.map(passage => (
					<CSSTransition classNames="pop" key={passage.id} timeout={200}>
						<PassageCard passage={passage} {...props} />
					</CSSTransition>
				))}
			</TransitionGroup>
		);
	}
);

PassageCardGroup.displayName = 'PassageCardGroup';