import RaisedPaper from '../raised-paper.vue';

function template(elevation, highlighted, selected) {
	let result = '<div>';

	['none', 'top', 'left', 'right', 'bottom'].forEach(
		arrowDir =>
			(result += `<raised-paper arrow="${arrowDir}" elevation="${elevation}" :highlighted="${highlighted}" :selected="${selected}" style="height: 100px; width: 100px; margin: 20px" />`)
	);

	return result + '</div>';
}

export default {title: 'Surface/<raised-paper>'};

export const low = () => ({
	components: {RaisedPaper},
	template: template('low')
});

export const lowHighlighted = () => ({
	components: {RaisedPaper},
	template: template('low', true)
});

export const lowSelected = () => ({
	components: {RaisedPaper},
	template: template('low', false, true)
});

export const high = () => ({
	components: {RaisedPaper},
	template: template('high')
});

export const highHighlighted = () => ({
	components: {RaisedPaper},
	template: template('high', true)
});

export const highSelected = () => ({
	components: {RaisedPaper},
	template: template('high', false, true)
});
