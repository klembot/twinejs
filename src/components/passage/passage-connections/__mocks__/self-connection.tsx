import * as React from 'react';
import {SelfConnectionProps} from '../self-connection';

export const SelfConnection: React.FC<SelfConnectionProps> = ({passage}) => (
	<div data-testid={`mock-self-connection-${passage.name}`} />
);
