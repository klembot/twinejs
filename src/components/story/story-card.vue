<template>
	<base-card class="story-card" image-position="horizontal">
		<template v-slot:image
			><story-preview :name="story.name" :passages="story.passages"
		/></template>
		<template v-slot:header>{{ story.name }}</template>
		<p>
			<span
				v-t="{
					path: 'components.storyCard.lastUpdated',
					args: {date: lastUpdateFormatted}
				}"
			/>
			<br />
			{{ $tc('components.storyCard.passageCount', story.passages.length) }}
		</p>
		<template v-slot:actions>
			<dropdown-button icon="more-horizontal" label="common.more">
				<icon-button @click="playStory" icon="play" label="common.play" />
				<icon-button @click="testStory" icon="tool" label="common.test" />
				<icon-button
					@click="publishStory"
					icon="download"
					label="common.publishToFile"
				/>
				<icon-button @click="renameStory" icon="type" label="common.rename" />
				<icon-button
					@click="duplicateStory"
					icon="copy"
					label="common.duplicate"
				/>
				<icon-button
					@click="deleteStory"
					icon="trash-2"
					label="common.delete"
					type="danger"
				/>
			</dropdown-button>
			<icon-button
				@click="editStory"
				icon="edit"
				label="common.edit"
				type="primary"
			/>
		</template>
	</base-card>
</template>

<script>
import BaseCard from '../container/base-card';
import DropdownButton from '../control/dropdown-button';
import IconButton from '../control/icon-button';
import StoryPreview from './story-preview';
import './story-card.css';

const dateFormatter = new Intl.DateTimeFormat([]);

export default {
	components: {BaseCard, DropdownButton, IconButton, StoryPreview},
	computed: {
		lastUpdateFormatted() {
			return dateFormatter.format(this.story.lastUpdate);
		},
		previewStyle() {
			return {
				background: `linear-gradient(to bottom, hsl(${this.hue}, 90%, 95%), hsl(${this.hue}, 90%, 85%))`,
				color: `hsla(${(this.hue + 45) % 360}, 90%, 40%, 0.25)`
			};
		}
	},
	methods: {
		deleteStory() {
			this.$emit('delete', this.story);
		},
		duplicateStory() {
			this.$emit('duplicate', this.story);
		},
		editStory() {
			this.$emit('edit', this.story);
		},
		playStory() {
			this.$emit('play', this.story);
		},
		publishStory() {
			this.$emit('publish', this.story);
		},
		renameStory() {
			this.$emit('rename', this.story);
		},
		testStory() {
			this.$emit('test', this.story);
		}
	},
	name: 'story-card',
	props: {
		story: {
			required: true,
			type: Object
		}
	}
};
</script>
