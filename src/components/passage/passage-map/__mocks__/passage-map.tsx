import * as React from 'react';
import {PassageMapProps} from '../passage-map';

export const PassageMap: React.FC<Partial<PassageMapProps>> = ({
	onMiddleClick
}) => (
	<div data-testid="mock-passage-map">
		<button onClick={() => onMiddleClick!({left: 150, top: 300})}>
			simulate middle click
		</button>
	</div>
);
