<template>
	<div class="story-format-card">
		<base-card image-position="horizontal" :selected="selected">
			<template v-slot:image>
				<icon-image name="clock" v-if="loadState === 'pending'" />
				<icon-image name="alert-triangle" v-if="loadState === 'failed'" />
				<template v-if="loadState === 'loaded'">
					<img
						:src="imageUrl"
						v-if="format.properties && format.properties.image"
					/>
					<icon-image name="file-text" v-else />
				</template>
			</template>
			<template v-slot:header>
				<span
					class="title"
					v-t="{
						path: 'components.storyFormatItem.name',
						args: {name: format.name, version: format.version}
					}"
				/>
			</template>
			<p
				class="author"
				v-if="loadState === 'loaded' && format.properties.author"
				v-t="{
					path: 'components.storyFormatItem.author',
					args: {author: format.properties.author}
				}"
			/>
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
			<template v-slot:actions v-if="loadState === 'loaded' && !selected">
				<icon-button
					@click="onRemove"
					icon="trash-2"
					label="common.remove"
					type="danger"
					v-if="canRemove"
				/>
				<icon-button
					:active="selected"
					@click="onSelect"
					icon="check"
					type="primary"
					>{{ selectLabel }}</icon-button
				>
			</template>
		</base-card>
	</div>
</template>

<script>
import BaseCard from '../container/base-card';
import IconButton from '../control/icon-button';
import IconImage from '../icon-image';
import './story-format-card.css';

export default {
	components: {BaseCard, IconButton, IconImage},
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
		selectLabel: {required: true, type: String},
		selected: {default: false, type: Boolean}
	}
};
</script>
