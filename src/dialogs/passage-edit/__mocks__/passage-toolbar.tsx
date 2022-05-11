import * as React from 'react';
import {PassageToolbarProps} from '../passage-toolbar';

export const PassageToolbar: React.FC<PassageToolbarProps> = ({passage}) => (
	<div data-testid={`mock-passage-toolbar-${passage.id}`} />
);
