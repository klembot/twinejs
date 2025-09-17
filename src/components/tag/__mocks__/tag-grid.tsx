import * as React from 'react';
import {TagGridProps} from '../tag-grid';

export const TagGrid: React.FC<TagGridProps> = ({tags}) => (
	<div data-testid="mock-tag-grid">{tags.join(' ')}</div>
);
