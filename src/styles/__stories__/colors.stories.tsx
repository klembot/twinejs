import * as React from 'react';
import '../colors.css';

const main = {title: 'Colors/Specimen'};
export default main;

const ColorBlock: React.FC<{color: string}> = ({color}) => (
	<span
		style={{
			display: 'inline-block',
			height: 50,
			margin: 5,
			width: 50,
			background: `var(--${color})`,
		}}
	/>
);

export const Specimen: React.FC = () => {
	const backgrounds = ['white', 'gray', 'black'];
	const flatColors = ['black', 'offwhite', 'white'];
	const shadedColors = [
		'gray',
		'red',
		'orange',
		'yellow',
		'green',
		'blue',
		'purple',
	];

	return (
		<div>
			{backgrounds.map((bg) => (
				<div style={{background: bg, padding: 5}}>
					{flatColors.map((color) => (
						<ColorBlock color={color} />
					))}
					{shadedColors.map((color) => (
						<>
							<ColorBlock color={`light-${color}-translucent`} />
							<ColorBlock color={`light-${color}`} />
							<ColorBlock color={color} />
							<ColorBlock color={`dark-${color}`} />
						</>
					))}
				</div>
			))}
		</div>
	);
};
