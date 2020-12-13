<template>
	<base-modal v-if="visible">
		<div class="add-tag-modal">
			<base-card>
				<template v-slot:header>
					<slot name="header"></slot>
				</template>
				<slot name="detail"></slot>
				<div class="controls">
					<text-line @input="onChangeName" :value="name">{{
						$t('common.name')
					}}</text-line>
					<color-select @change="onChangeColor" :value="color">{{
						$t('common.color')
					}}</color-select>
				</div>
				<template v-slot:actions>
					<icon-button @click="onCancel" icon="x" label="common.cancel" />
					<icon-button
						@click="onSubmit"
						:disabled="name.trim() === ''"
						:icon="submitIcon"
						:label="submitLabel"
						:type="submitType"
					/>
				</template>
			</base-card>
		</div>
	</base-modal>
</template>

<script>
import BaseCard from '../container/base-card';
import BaseModal from '../modal/base-modal';
import ColorSelect from '../control/color-select';
import IconButton from '../control/icon-button';
import TextLine from '../control/text-line';
import isTagColor from '@/util/tag-color';
import './tag-modal.css';

export default {
	components: {BaseCard, BaseModal, ColorSelect, IconButton, TextLine},
	data() {
		return {color: 'none', name: ''};
	},
	methods: {
		onCancel() {
			this.$emit('cancel');
		},
		onChangeColor(value) {
			this.color = value;
		},
		onChangeName(value) {
			this.name = value.replace(/\s/g, '-');
		},
		onSubmit() {
			this.$emit('submit', {color: this.color, name: this.name});
		}
	},
	name: 'tag-modal',
	props: {
		defaultColor: {default: 'none', validator: isTagColor},
		defaultName: {default: '', type: String},
		submitIcon: {default: 'check', type: String},
		submitLabel: {default: 'common.save', type: String},
		submitType: {default: 'primary', type: String},
		visible: {default: true, type: Boolean}
	},
	watch: {
		visible(value) {
			if (value) {
				this.color = this.defaultColor;
				this.name = this.defaultName;
			}
		}
	}
};
</script>
