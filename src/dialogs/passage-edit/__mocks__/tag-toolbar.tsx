import * as React from 'react';
import {TagToolbarProps} from '../tag-toolbar';

export const TagToolbar: React.FC<TagToolbarProps> = ({passage}) => (
	<div data-testid={`mock-tag-toolbar-${passage.id}`} />
);
