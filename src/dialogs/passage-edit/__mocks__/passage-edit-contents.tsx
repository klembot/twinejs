import * as React from 'react';
import {PassageEditContentsProps} from '../passage-edit-contents';

export const PassageEditContents: React.FC<PassageEditContentsProps> = ({
	passageId,
	storyId
}) => (
	<div data-testid={`mock-passage-edit-contents-${storyId}-${passageId}`} />
);
