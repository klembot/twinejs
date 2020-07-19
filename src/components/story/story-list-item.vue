<template>
	<div class="story-list-item">
		<button class="preview-button" @click="edit" :style="previewButtonStyle">
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
						<icon-button icon="edit" label="common.edit" type="flat" />
						<icon-button icon="play" label="common.play" type="flat" />
						<icon-button icon="tool" label="common.test" type="flat" />
						<icon-button
							icon="download"
							type="flat"
							label="common.publishToFile"
						/>
						<icon-button icon="type" label="common.rename" type="flat" />
						<icon-button icon="copy" label="common.duplicate" type="flat" />
						<icon-button icon="trash-2" label="common.delete" type="flat" />
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
import openUrl from '@/util/open-url';
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
		edit() {
			this.$emit('edit', this.story);
		},
		play() {
			// FIXME?
			openUrl(`#stories/${this.story.id}/play`);
		},
		test() {
			// FIXME?
			openUrl(`#stories/${this.story.id}/test`);
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
