import * as React from 'react';
import {TagBadgesProps} from '../tag-badges';

export const TagBadges: React.FC<TagBadgesProps> = ({tags}) => (
	<div data-testid="mock-tag-badges">{tags.join(' ')}</div>
);
