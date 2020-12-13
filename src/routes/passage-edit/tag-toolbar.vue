<template>
	<div class="tag-toolbar">
		<button-bar>
			<icon-button
				@click="toggleAddTag"
				icon="plus"
				label="common.tag"
				type="create"
			/>
			<tag-button
				v-for="tag in passage.tags"
				:color="tagColors[tag]"
				@edit-tag="onStartEditTag({color: tagColors[tag], name: tag})"
				:key="tag"
				:label="tag"
				@remove-tag="onRemoveTag(tag)"
			/>
		</button-bar>
		<tag-modal
			@cancel="toggleAddTag"
			@submit="onAddTag"
			submit-icon="plus"
			submit-label="common.add"
			submit-type="create"
			:visible="addTagVisible"
		>
			<template v-slot:header>{{
				$t('passageEdit.tagToolbar.addTagHeader')
			}}</template>
		</tag-modal>
		<tag-modal
			@cancel="toggleEditTag"
			:default-color="editingTagColor"
			:default-name="editingTagName"
			@submit="onEditTag"
			:visible="editTagVisible"
		>
			<template v-slot:header>{{
				$t('passageEdit.tagToolbar.editTagHeader')
			}}</template>
			<template v-slot:detail
				><p v-t="'passageEdit.tagToolbar.editTagDetail'" />
			</template>
		</tag-modal>
	</div>
</template>

<script>
import ButtonBar from '@/components/container/button-bar';
import IconButton from '@/components/control/icon-button';
import TagButton from '@/components/tag/tag-button';
import TagModal from '@/components/tag/tag-modal';
import isTagColor from '@/util/tag-color';

export default {
	components: {ButtonBar, IconButton, TagButton, TagModal},
	data() {
		return {
			addTagVisible: false,
			editTagVisible: false,
			editingTagColor: undefined,
			editingTagName: undefined
		};
	},
	methods: {
		onAddTag({color, name}) {
			this.addTagVisible = false;
			this.$emit('add-tag', {color, name});
		},
		onEditTag({color, name}) {
			this.$emit('edit-tag', {
				newColor: color,
				newName: name,
				oldColor: this.editingTagColor,
				oldName: this.editingTagName
			});
			this.toggleEditTag();
		},
		onStartEditTag({color, name}) {
			this.editingTagColor = color;
			this.editingTagName = name;
			this.toggleEditTag();
		},
		onRemoveTag(name) {
			this.$emit('remove-tag', name);
		},
		toggleAddTag() {
			this.addTagVisible = !this.addTagVisible;
		},
		toggleEditTag() {
			this.editTagVisible = !this.editTagVisible;
		}
	},
	name: 'tag-toolbar',
	props: {
		passage: {required: true, type: Object},
		tagColors: {
			required: true,
			validator: value =>
				Object.keys(value).every(key => isTagColor(value[key]))
		}
	}
};
</script>
