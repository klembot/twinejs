<template>
	<div class="story-format-group">
		<h1>{{ header }}</h1>
		<p>{{ detail }}</p>
		<card-group column-width="500px">
			<story-format-card
				v-for="(format, index) in formats"
				:format="format"
				:key="index"
				@select="onSelectFormat"
				:selected="format === selectedFormat"
				:selectLabel="selectLabel"
			/>
		</card-group>
	</div>
</template>

<script>
import CardGroup from '../container/card-group';
import StoryFormatCard from './story-format-card';

export default {
	components: {CardGroup, StoryFormatCard},
	methods: {
		onSelectFormat(format) {
			this.$emit('select', format);
		}
	},
	name: 'story-format-group',
	props: {
		detail: {type: String},
		formats: {required: true, type: Array},
		header: {required: true, type: String},
		selectLabel: {required: true, type: String},
		selectedFormat: {type: Object}
	}
};
</script>
