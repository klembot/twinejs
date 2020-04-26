<template>
	<div class="story-format-item">
		<div class="summary">
			<div class="title">
				<img alt="" class="format-image" :src="imageUrl" />
				<span
					v-t="{
						path: 'components.storyFormatItem.header',
						args: {
							author: format.properties.author,
							name: format.name,
							version: format.version
						}
					}"
				/>
			</div>
			<div class="buttons">
				<slot name="buttons" />
				<template v-if="!alwaysExpanded">
					<icon-button
						@click="toggleExpanded"
						icon="chevron-up"
						v-if="expanded"
					/>
					<icon-button @click="toggleExpanded" icon="chevron-down" v-else />
				</template>
			</div>
		</div>
		<div class="description" v-if="expanded || alwaysExpanded">
			<p v-html="format.properties.description"></p>
			<p>
				<em
					v-t="{
						path: 'components.storyFormatItem.license',
						args: {license: format.properties.license}
					}"
				/>
			</p>
			<slot name="description-footer"></slot>
		</div>
	</div>
</template>

<script>
import IconButton from '../input/icon-button';
import './story-format-item.less';

export default {
	components: {IconButton},
	computed: {
		imageUrl() {
			return (
				this.format.url.replace(/\/[^/]*?$/, '/') + this.format.properties.image
			);
		}
	},
	data() {
		return {expanded: false};
	},
	methods: {
		toggleExpanded() {
			this.expanded = !this.expanded;
		}
	},
	name: 'story-format-item',
	props: {
		alwaysExpanded: {
			default: false,
			type: Boolean
		},
		format: {
			required: true,
			type: Object
		}
	}
};
</script>
