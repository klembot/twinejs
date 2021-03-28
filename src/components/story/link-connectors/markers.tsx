import * as React from 'react';
import './markers.css';

/**
 * Arrowheads used on connectors. Arrowheads must be applied by an inline style.
 * There seems to be disagreement on the proper way to implement this, but it
 * does not work in an external stylesheet in Firefox.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker
 */
export const LinkMarkers: React.FC = () => (
	<defs>
		<marker
			id="link-arrowhead"
			refX="6"
			refY="4"
			markerWidth="8"
			markerHeight="8"
			orient="auto"
		>
			<path d="M 1,1 7,4 1,7 Z" />
		</marker>
		<marker
			id="link-broken"
			refX="6"
			refY="6"
			markerWidth="12"
			markerHeight="12"
		>
			<line x1="9" y1="3" x2="3" y2="9"></line>
			<line x1="3" y1="3" x2="9" y2="9"></line>
		</marker>
	</defs>
);
