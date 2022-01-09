import * as React from 'react';
import {PassageConnectionProps} from '../passage-connection';

export const PassageConnection: React.FC<PassageConnectionProps> = ({
	end,
	start
}) => <div data-testid={`mock-passage-connection-${start.name}-${end.name}`} />;
