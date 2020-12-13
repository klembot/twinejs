<template>
	<span :class="classes">
		<dropdown-button icon="tag-nub" :label="label">
			<icon-button @click="onEdit" icon="edit" label="common.edit" />
			<icon-button
				@click="onRemove"
				icon="trash-2"
				label="common.remove"
				type="danger"
			/>
		</dropdown-button>
	</span>
</template>

<script>
import DropdownButton from '../control/dropdown-button';
import IconButton from '../control/icon-button';
import isTagColor from '@/util/tag-color';
import './tag-button.css';

export default {
	components: {DropdownButton, IconButton},
	computed: {
		classes() {
			return {
				[`color-${this.color}`]: true,
				'tag-button': true
			};
		}
	},
	methods: {
		onEdit() {
			this.$emit('edit-tag');
		},
		onRemove() {
			this.$emit('remove-tag');
		}
	},
	name: 'tag-button',
	props: {
		color: {
			default: 'none',
			type: String,
			validator: isTagColor
		},
		label: {required: true, type: String}
	}
};
</script>
