<template>
	<div class="welcome-block" :style="style">
		<h1>{{title}}</h1>
		<p class="larger">
			<slot></slot>
		</p>
		<p class="buttons">
			<icon-button @click="onNext" type="primary" :label="nextLabel" />
			<icon-button @click="onSkip" label="Skip" v-if="showSkip" />
		</p>
	</div>
</template>

<script>
import IconButton from '../form/icon-button';
import './welcome-block.less';

export default {
	components: {IconButton},
	computed: {
		style() {
			return {backgroundImage: `url(${this.image})`};
		}
	},
	methods: {
		onNext() {
			this.$emit('next');
		},
		onSkip() {
			this.$emit('skip');
		}
	},
	name: 'welcome-block',
	props: {
		nextLabel: {
			default: 'OK',
			type: String
		},
		showSkip: Boolean,
		image: String,
		title: String
	}
};
</script>