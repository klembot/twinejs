<template>
	<div class="welcome-block stack">
		<div class="image">
			<icon-image :name="icon" v-if="icon" />
			<img :src="image" alt="" v-if="image" />
		</div>
		<div class="stack vertical">
			<h2>{{ title }}</h2>
			<div><slot></slot></div>
			<div class="stack horizontal">
				<icon-button @click="onNext" icon="arrow-right" raised type="primary">{{
					nextLabel
				}}</icon-button>
				<icon-button
					@click="onSkip"
					icon="fast-forward"
					label="common.skip"
					raised
					v-if="showSkip"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import IconImage from '../icon-image';
import IconButton from '../input/icon-button';
import './welcome-block.less';

export default {
	components: {IconButton, IconImage},
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
		icon: {
			type: String
		},
		image: {
			type: String
		},
		title: {
			required: true,
			type: String
		}
	}
};
</script>
