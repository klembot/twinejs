import {IconSpace} from '@tabler/icons';
import * as React from 'react';

export interface VisibleWhitespaceProps {
	value: string;
}

/**
 * Makes leading and trailing whitespace in a string visible.
 */
export const VisibleWhitespace: React.FC<VisibleWhitespaceProps> = ({
	value
}) => {
	const leadingMatch = /^\s*/.exec(value);
	const leaders = leadingMatch ? leadingMatch[0].length : 0;
	const trailingMatch = /\s*$/.exec(value);
	const trailers = trailingMatch ? trailingMatch[0].length : 0;

	return (
		<span className="visible-whitespace">
			{[...Array(leaders)].map((_, index) => (
				<IconSpace key={index} />
			))}
			{value.trim()}
			{[...Array(trailers)].map((_, index) => (
				<IconSpace key={index} />
			))}
		</span>
	);
};
