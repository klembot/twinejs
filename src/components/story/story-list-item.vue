<template>
	<div class="story-list-item">
		<div class="stack close vertical">
			<story-preview @click="edit" :hue="0" :passages="story.passages" />
			<div class="stack">
				<h3 class="grow">{{ story.name }}</h3>
				<anchored-paper :allowFlip="true" position="top" :visible="menuVisible">
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
