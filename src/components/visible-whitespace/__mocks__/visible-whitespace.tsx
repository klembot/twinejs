import * as React from 'react';
import {VisibleWhitespaceProps} from '../visible-whitespace';

export const VisibleWhitespace: React.FC<VisibleWhitespaceProps> = ({
	value
}) => <span data-testid="mock-visible-whitespace">{value}</span>;
