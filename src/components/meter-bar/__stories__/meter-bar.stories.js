import MeterBar from '../index.vue';
import notes from './meter-bar.notes.md';

export default {parameters: {notes}, title: '<meter-bar>'};

const components = {MeterBar};

export const full = () => ({
	components,
	template: '<meter-bar :percent="100" />'
});

export const fullLabeled = () => ({
	components,
	template: '<meter-bar :percent="100">Done</meter-bar>'
});

export const half = () => ({
	components,
	template: '<meter-bar :percent="50" />'
});

export const empty = () => ({
	components,
	template: '<meter-bar :percent="0"></meter-bar>'
});

export const indeterminate = () => ({
	components,
	template: '<meter-bar indeterminate></meter-bar>'
});
