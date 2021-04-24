import * as React from 'react';

export const IconTwine: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
		width="1200"
		height="1200"
	>
		<defs>
			<linearGradient id="b">
				<stop offset="0" stop-color="#127aee" />
				<stop offset="1" stop-color="#117aef" stop-opacity=".251" />
			</linearGradient>
			<linearGradient id="a">
				<stop offset="0" stop-color="#10f05e" stop-opacity=".251" />
				<stop offset="1" stop-color="#10f05e" />
			</linearGradient>
			<linearGradient
				xlinkHref="#a"
				id="d"
				x1="52"
				y1="604.362"
				x2="972"
				y2="604.362"
				gradientUnits="userSpaceOnUse"
			/>
			<linearGradient
				xlinkHref="#b"
				id="c"
				x1="256"
				y1="0"
				x2="231.987"
				y2="725.548"
				gradientUnits="userSpaceOnUse"
				gradientTransform="translate(0 28.362)"
			/>
		</defs>
		<path
			fill="url(#c)"
			d="M64 28.362h384v1024H64z"
			transform="translate(88 59.638)"
		/>
		<path
			d="M64 860.362c0-704 896-704 896-704v384s-512 0-512 320v192H64z"
			fill="url(#d)"
			transform="translate(88 59.638)"
		/>
	</svg>
);
