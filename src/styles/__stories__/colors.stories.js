import '../colors.css';

export default {title: 'Colors/Specimen'};

function colorBlock(color) {
	return `<span style="display: inline-block; height: 50px; width: 50px; background: var(--${color})" />`;
}

export const specimen = () => {
	const backgrounds = ['white', 'gray', 'black'];
	const flatColors = ['black', 'offwhite', 'white'];
	const shadedColors = [
		'gray',
		'red',
		'orange',
		'yellow',
		'green',
		'blue',
		'purple'
	];

	return (
		'<div>' +
		backgrounds.reduce(
			(output, current) =>
				output +
				`<div style="background: ${current}">` +
				flatColors.reduce(
					(output, current) => output + colorBlock(current),
					''
				) +
				shadedColors.reduce(
					(output, current) =>
						output +
						'<div>' +
						colorBlock(`light-${current}-translucent`) +
						colorBlock(`light-${current}`) +
						colorBlock(current) +
						colorBlock(`dark-${current}`) +
						colorBlock(`dark-${current}-translucent`) +
						'</div>',
					''
				) +
				'</div>',
			''
		) +
		'</div>'
	);
};
