<template>
	<div class="story-format-picker">
		<slot name="header"></slot>

		<div v-if="selectedFormat">
			<story-format-item :always-expanded="true" :format="selectedFormat" />
		</div>

		<div class="unselected-formats">
			<story-format-item
				v-for="format in unselectedFormats"
				:format="format"
				:key="format.id"
			>
				<template v-slot:buttons>
					<icon-button
						@click="onSelect(format)"
						:icon="selectIcon"
						:label="selectLabel"
						type="primary"
					/>
				</template>

				<template v-slot:description-footer>
					<icon-button
						v-if="allowDelete && format.userAdded"
						@click="onDelete(format)"
						icon="trash"
						:label="`Remove ${format.name} ${format.version}`"
						type="danger"
					/>
				</template>
			</story-format-item>
		</div>
	</div>
</template>

<script>
import IconButton from '../input/icon-button';
import StoryFormatItem from './story-format-item';
import './story-format-picker.less';

export default {
	components: {IconButton, StoryFormatItem},
	computed: {
		unselectedFormats() {
			return this.formats.filter(f => f !== this.selectedFormat);
		}
	},
	methods: {
		onDelete(format) {
			this.$emit('delete-format', format);
		},
		onSelect(format) {
			this.$emit('select-format', format);
		}
	},
	props: {
		allowDelete: {
			default: true,
			type: Boolean
		},
		formats: {
			required: true,
			type: Array
		},
		selectIcon: {
			default: 'check',
			type: String
		},
		selectLabel: {
			default: 'Select',
			type: String
		},
		selectedFormat: {
			type: Object
		}
	}
};
</script>
