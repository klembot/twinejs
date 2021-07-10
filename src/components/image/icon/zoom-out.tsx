// Fixes a bug in Tabler icons where the zoom out icon is not exported as a
// React component. This SVG should be an exact copy of what's in the package.

import * as React from 'react';

export const IconZoomOut: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="icon icon-tabler icon-tabler-zoom-out"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		strokeWidth="2"
		stroke="currentColor"
		fill="none"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<circle cx="10" cy="10" r="7" />
		<line x1="7" y1="10" x2="13" y2="10" />
		<line x1="21" y1="21" x2="15" y2="15" />
	</svg>
);
