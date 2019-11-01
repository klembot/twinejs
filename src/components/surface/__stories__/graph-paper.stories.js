import GraphPaper from '../graph-paper.vue';

function template(size) {
	return `<div style="height: 100vh; width: 100vw"><graph-paper size="${size}" /></div>`;
}

export default {title: 'Surface/<graph-paper>'};

export const small = () => ({
	components: {GraphPaper},
	template: template('small')
});

export const medium = () => ({
	components: {GraphPaper},
	template: template('medium')
});

export const large = () => ({
	components: {GraphPaper},
	template: template('large')
});
