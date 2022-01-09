import * as React from 'react';
import {BrokenConnectionProps} from '../broken-connection';

export const BrokenConnection: React.FC<BrokenConnectionProps> = ({
	passage
}) => <div data-testid={`mock-broken-connection-${passage.name}`} />;
