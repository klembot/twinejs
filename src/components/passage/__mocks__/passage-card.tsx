import * as React from 'react';
import {PassageCardProps} from '../passage-card';

export const PassageCard: React.FC<PassageCardProps> = ({passage}) => (
	<div data-testid={`mock-passage-card-${passage.name}`} />
);
