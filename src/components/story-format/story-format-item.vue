<template>
	<div class="story-format-item">
		<raised-paper :selected="selected">
			<div class="image">
				<icon-image name="clock" v-if="loadState === 'pending'" />
				<icon-image name="alert-triangle" v-if="loadState === 'failed'" />
				<template v-if="loadState === 'loaded'">
					<img
						:src="imageUrl"
						v-if="format.properties && format.properties.image"
					/>
					<icon-image name="file-text" v-else />
				</template>
			</div>
			<div class="detail">
				<p>
					<span
						class="title"
						v-t="{
							path: 'components.storyFormatItem.name',
							args: {name: format.name, version: format.version}
						}"
					/>
					<span
						class="author"
						v-if="loadState === 'loaded' && format.properties.author"
						v-t="{
							path: 'components.storyFormatItem.author',
							args: {author: format.properties.author}
						}"
					/>
				</p>
				<div
					class="properties"
					v-html="format.properties.description"
					v-if="loadState === 'loaded'"
				/>
				<div class="error" v-if="loadState === 'failed'">
					<p
						v-t="{
							path: 'components.storyFormatItem.loadError',
							args: {error: format.loadError}
						}"
					/>
				</div>
				<div
					class="loading"
					v-if="loadState === 'pending'"
					v-t="components.storyFormatItem.loading"
				/>
			</div>
			<div class="actions" v-if="loadState === 'loaded'">
				<template v-if="selected">
					{{ selectedText }}
				</template>
				<template v-else>
					<icon-button
						@click="onRemove"
						icon="trash-2"
						label="common.remove"
						raised
						type="danger"
						v-if="canRemove"
					/>
					<icon-button
						:active="selected"
						@click="onSelect"
						:icon="selectIcon"
						raised
						>{{ selectLabel }}</icon-button
					>
				</template>
			</div>
		</raised-paper>
	</div>
</template>

<script>
import IconButton from '../input/icon-button';
import IconImage from '../icon-image';
import RaisedPaper from '../surface/raised-paper';
import './story-format-item.less';

export default {
	components: {IconButton, IconImage, RaisedPaper},
	computed: {
		loadState() {
			if (this.format.loadError) {
				return 'failed';
			}

			if (this.format.properties) {
				return 'loaded';
			}

			return 'pending';
		},
		imageUrl() {
			return this.format.userAdded
				? ''
				: process.env.BASE_URL +
						this.format.url.replace(/\/[^/]*?$/, '/') +
						this.format.properties.image;
		}
	},
	methods: {
		onRemove() {
			this.$emit('remove', this.format);
		},
		onSelect() {
			this.$emit('select', this.format);
		}
	},
	name: 'story-format-item',
	props: {
		canRemove: {default: false, type: Boolean},
		format: {required: true, type: Object},
		selectIcon: {default: 'check', type: String},
		selectLabel: {required: true, type: String},
		selected: {default: false, type: Boolean},
		selectedText: {type: String}
	}
};
</script>
