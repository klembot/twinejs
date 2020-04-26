import RaisedPaper from '../raised-paper.vue';

function template(elevation) {
	let result = '<div>';

	['none', 'top', 'left', 'right', 'bottom'].forEach(
		arrowDir =>
			(result += `<raised-paper arrow="${arrowDir}" elevation="${elevation}" style="height: 100px; width: 100px; margin: 20px" />`)
	);

	return result + '</div>';
}

export default {title: 'Surface/<raised-paper>'};

export const low = () => ({
	components: {RaisedPaper},
	template: template('low')
});

export const high = () => ({
	components: {RaisedPaper},
	template: template('high')
});
