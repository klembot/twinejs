import * as React from 'react';
import {StartConnectionProps} from '../start-connection';

export const StartConnection: React.FC<StartConnectionProps> = ({passage}) => (
	<div data-testid={`mock-start-connection-${passage.name}`} />
);
