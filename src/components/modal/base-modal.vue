<template>
	<portal v-if="visible">
		<div class="base-modal">
			<div class="overlay" @click="clickAway" />
			<div class="content"><slot></slot></div>
		</div>
	</portal>
</template>

<script>
import {Portal} from '@linusborg/vue-simple-portal';
import './base-modal.css';

export default {
	components: {Portal},
	methods: {
		clickAway() {
			this.$emit('click-away');
		}
	},
	name: 'base-modal',
	props: {
		visible: {
			default: true,
			type: Boolean
		}
	}
};
</script>
