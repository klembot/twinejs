<template>
	<span
		:aria-hidden="!label || label === ''"
		:aria-label="label"
		:class="classes"
		v-html="svg"
	/>
</template>

<script>
import {icons} from 'feather-icons';
import emptySvg from './extra-icons/empty.svg';
import gridSmallSvg from './extra-icons/grid-small.svg';
import tagNubSvg from './extra-icons/tag-nub.svg';
import './index.css';

const extraIcons = {
	empty: emptySvg,
	'grid-small': gridSmallSvg,
	'tag-nub': tagNubSvg
};

export default {
	computed: {
		classes() {
			return {
				'icon-image': true,
				'loading-spinner': this.name === 'loading-spinner'
			};
		},
		svg() {
			if (this.name === 'loading-spinner') {
				return icons.circle.toSvg();
			}

			if (extraIcons[this.name]) {
				return extraIcons[this.name];
			}

			if (icons[this.name]) {
				return icons[this.name].toSvg();
			}

			throw new Error(`There is no icon image with name "${this.name}".`);
		}
	},
	name: 'icon-image',
	props: {
		label: String,
		name: {
			type: String,
			required: true
		}
	},
	render: {}
};
</script>
