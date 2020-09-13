<template>
	<div class="story-list-item">
		<button
			class="preview-button"
			@click="editStory"
			:style="previewButtonStyle"
		>
			<story-preview :name="story.name" :passages="story.passages" />
		</button>
		<div class="details">
			{{ story.name }}
			<anchored-paper
				:allowFlip="true"
				@click-away="toggleMenu"
				position="bottom"
				:visible="menuVisible"
			>
				<template v-slot:anchor>
					<icon-button @click="toggleMenu" icon="settings" />
				</template>
				<template v-slot:paper>
					<div class="stack vertical tight">
						<icon-button @click="editStory" icon="edit" label="common.edit" />
						<icon-button @click="playStory" icon="play" label="common.play" />
						<icon-button @click="testStory" icon="tool" label="common.test" />
						<icon-button
							@click="publishStory"
							icon="download"
							label="common.publishToFile"
						/>
						<icon-button
							@click="renameStory"
							icon="type"
							label="common.rename"
						/>
						<icon-button
							@click="duplicateStory"
							icon="copy"
							label="common.duplicate"
						/>
						<icon-button
							@click="deleteStory"
							icon="trash-2"
							label="common.delete"
						/>
					</div>
				</template>
			</anchored-paper>
		</div>
	</div>
</template>

<script>
import AnchoredPaper from '../surface/anchored-paper';
import IconButton from '../input/icon-button';
import StoryPreview from './story-preview';
import './story-list-item.less';

export default {
	components: {
		AnchoredPaper,
		IconButton,
		StoryPreview
	},
	computed: {
		hue() {
			let result = 0;

			for (let i = 0; i < this.story.name.length; i++) {
				result += this.story.name.charCodeAt(i);
			}

			return result % 360;
		},
		previewButtonStyle() {
			return {
				background: `linear-gradient(to bottom, hsl(${this.hue}, 90%, 95%), hsl(${this.hue}, 90%, 85%))`,
				color: `hsla(${(this.hue + 45) % 360}, 90%, 40%, 0.25)`
			};
		}
	},
	data() {
		return {menuVisible: false};
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
		},
		toggleMenu() {
			this.menuVisible = !this.menuVisible;
		}
	},
	props: {
		story: {
			required: true,
			type: Object
		}
	}
};
</script>
