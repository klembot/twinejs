<template>
	<div class="welcome-block stack">
		<img class="image" :src="this.image" alt="" />
		<div class="stack vertical">
			<h2>{{ title }}</h2>
			<div><slot></slot></div>
			<div class="stack horizontal">
				<icon-button @click="onNext" icon="arrow-right" type="primary">{{
					nextLabel
				}}</icon-button>
				<icon-button
					@click="onSkip"
					icon="fast-forward"
					v-if="showSkip"
					v-t="'common.skip'"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import IconButton from '../input/icon-button';
import './welcome-block.less';

export default {
	components: {IconButton},
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
		showSkip: {
			default: false,
			type: Boolean
		},
		image: {
			required: true,
			type: String
		},
		title: {
			required: true,
			type: String
		}
	}
};
</script>
