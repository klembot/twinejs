import * as React from 'react';
import {Platform} from '../util/platform';
import {keyStringTokens} from './key-string';
import './key-chip.css';

export interface KeyChipProps {
	keyString: string;
	platform: Platform;
}

/**
 * Renders a key string as a row of <kbd> elements, e.g. ⌘ ⇧ P.
 */
export const KeyChip: React.FC<KeyChipProps> = ({keyString, platform}) => {
	const tokens = keyStringTokens(keyString, platform);

	if (tokens.length === 0) {
		return null;
	}

	return (
		<span className="key-chip">
			{tokens.map((token, index) => (
				<kbd key={index}>{token}</kbd>
			))}
		</span>
	);
};
