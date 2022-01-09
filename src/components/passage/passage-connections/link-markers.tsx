import * as React from 'react';
import './link-markers.css';

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
			refX="7.5"
			refY="7.5"
			markerWidth="15"
			markerHeight="15"
		>
			<circle cx="7.5" cy="7.5" r="7.5" />
			<path d="M4.5 7.5h 6z" />
		</marker>
		<marker
			id="link-start"
			markerWidth="15"
			markerHeight="15"
			refX="16"
			refY="16"
			viewBox="0 0 32 32"
		>
			<circle cx="16" cy="16" r="16" />
			<path d="M8 17a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" />
			<path d="M11 18a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" />
			<circle className="fill-white" cx="19" cy="13" r="1" />
		</marker>
	</defs>
);
