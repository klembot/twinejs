import {icons} from 'feather-icons';
import IconImage from '../index';
import notes from './icon-image.notes.md';

export default {title: '<icon-image>', parameters: {notes}};

export const specimen = () => ({
	components: {IconImage},
	computed: {
		iconNames() {
			return [
				...Object.keys(icons),
				'empty',
				'grid-small',
				'loading-spinner',
				'tag-nub'
			].sort();
		}
	},
	template:
		'<div><span v-for="iconName in iconNames" style="display: inline-block; width: 12em"><icon-image :name="iconName" />{{iconName}}</span></div>'
});

export const labeled = () => ({
	components: {IconImage},
	template: '<icon-image name="check" label="Enabled" />'
});

export const unlabeled = () => ({
	components: {IconImage},
	template: '<icon-image name="x" />'
});
