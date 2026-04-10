import * as React from 'react';
import {TagColors} from '../../store/stories';
import './tag-badges.css';

export interface TagBadgesProps {
	tagColors: TagColors;
	tags: string[];
}

export const TagBadges: React.FC<TagBadgesProps> = React.memo(props => {
	return (
		<div className="tag-badges">
			{props.tags.map(tag => (
				<span className={`color-${props.tagColors[tag]}`} key={tag}>
					{tag}
				</span>
			))}
		</div>
	);
});

TagBadges.displayName = 'TagBadges';
