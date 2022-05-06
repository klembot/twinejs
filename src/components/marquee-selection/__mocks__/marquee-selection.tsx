import * as React from 'react';
import {MarqueeSelectionProps} from '../marquee-selection';

export const MarqueeSelection: React.FC<MarqueeSelectionProps> = props => (
	<div data-testid="mock-marquee-selection">
		<button
			onClick={() =>
				props.onSelectRect({top: 10, left: 10, width: 100, height: 150}, false)
			}
		>
			onSelectRect
		</button>
		<button
			onClick={() =>
				props.onSelectRect({top: 10, left: 10, width: 100, height: 150}, true)
			}
		>
			onSelectRect additive
		</button>
		<button
			onClick={() =>
				props.onTemporarySelectRect(
					{top: 10, left: 10, width: 100, height: 150},
					true
				)
			}
		>
			onTemporarySelectRect
		</button>
		<button
			onClick={() =>
				props.onTemporarySelectRect(
					{top: 10, left: 10, width: 100, height: 150},
					true
				)
			}
		>
			onTemporarySelectRect additive
		</button>
	</div>
);
