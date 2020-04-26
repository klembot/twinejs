import LinkArrow from '../link-arrow';

export default {title: 'story/<link-arrow>'};

const start = {
	left: 20,
	top: 20,
	height: 100,
	width: 100
};

const end = {
	left: 200,
	top: 200,
	height: 100,
	width: 100
};

export const brokenLink = () => ({
	components: {LinkArrow},
	computed: {pts: () => ({start, end})},
	template:
		'<svg style="width: 500px; height: 500px"><link-arrow :start="pts.start" /></svg>'
});

export const downRight = () => ({
	components: {LinkArrow},
	computed: {pts: () => ({start, end})},
	template:
		'<svg style="width: 500px; height: 500px"><link-arrow :start="pts.start" :end="pts.end" /></svg>'
});

export const selfLink = () => ({
	components: {LinkArrow},
	computed: {pts: () => ({start, end})},
	template:
		'<svg style="width: 500px; height: 500px"><link-arrow :start="pts.end" :end="pts.end" /></svg>'
});

export const startVertical = () => ({
	components: {LinkArrow},
	computed: {pts: () => ({start, end})},
	template:
		'<svg style="width: 500px; height: 500px"><link-arrow :start="pts.start" :end="pts.end" /></svg>'
});

export const upLeft = () => ({
	components: {LinkArrow},
	computed: {pts: () => ({start, end})},
	template:
		'<svg style="width: 500px; height: 500px"><link-arrow :start="pts.end" :end="pts.start" /></svg>'
});
