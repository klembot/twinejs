<template>
	<base-card image-position="horizontal">
		<template v-slot:image><img :src="image" alt=""/></template>
		<template v-slot:header>{{ title }}</template>
		<slot></slot>
		<template v-slot:actions>
			<icon-button
				@click="onSkip"
				icon="fast-forward"
				label="common.skip"
				v-if="showSkip"
			/>
			<icon-button @click="onNext" icon="arrow-right" type="primary">{{
				nextLabel
			}}</icon-button>
		</template>
	</base-card>
</template>

<script>
import BaseCard from '../container/base-card';
import IconButton from '../control/icon-button';

export default {
	components: {BaseCard, IconButton},
	methods: {
		onNext() {
			this.$emit('next');
		},
		onSkip() {
			this.$emit('skip');
		}
	},
	name: 'welcome-card',
	props: {
		image: {
			required: true,
			type: String
		},
		nextLabel: {
			required: true,
			type: String
		},
		showSkip: {
			default: false,
			type: Boolean
		},
		title: {
			required: true,
			type: String
		}
	}
};
</script>
