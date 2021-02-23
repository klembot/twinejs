<template>
	<div class="font-picker">
		<dropdown-button icon="type" label="components.fontPicker.font">
			<icon-button
				@click="changeFamily('var(--font-monospaced)')"
				:icon="fontFamily === 'var(--font-monospaced)' ? 'check' : 'empty'"
				label="components.fontPicker.fonts.monospaced"
			/>
			<icon-button
				@click="changeFamily('var(--font-system)')"
				:icon="fontFamily === 'var(--font-system)' ? 'check' : 'empty'"
				label="components.fontPicker.fonts.system"
			/>
			<icon-button
				@click="toggleCustomFamilyPrompt"
				:icon="isCustomFont ? 'check' : 'empty'"
				label="common.custom"
			/>
		</dropdown-button>
		<dropdown-button icon="type-size" label="components.fontPicker.fontSize">
			<icon-button
				@click="changeScale(-1)"
				:icon="fontScale === -1 ? 'check' : 'empty'"
				label="components.fontPicker.sizes.auto"
			/>
			<icon-button
				@click="changeScale(0.8)"
				:icon="fontScale === 0.8 ? 'check' : 'empty'"
				>{{
					$t('components.fontPicker.sizes.percent', {percent: 80})
				}}</icon-button
			>
			<icon-button
				@click="changeScale(0.9)"
				:icon="fontScale === 0.9 ? 'check' : 'empty'"
				>{{
					$t('components.fontPicker.sizes.percent', {percent: 90})
				}}</icon-button
			>
			<icon-button
				@click="changeScale(1)"
				:icon="fontScale === 1 ? 'check' : 'empty'"
				>{{
					$t('components.fontPicker.sizes.percent', {percent: 100})
				}}</icon-button
			>
			<icon-button
				@click="changeScale(1.25)"
				:icon="fontScale === 1.25 ? 'check' : 'empty'"
				>{{
					$t('components.fontPicker.sizes.percent', {percent: 125})
				}}</icon-button
			>
			<icon-button
				@click="changeScale(1.5)"
				:icon="fontScale === 1.5 ? 'check' : 'empty'"
				>{{
					$t('components.fontPicker.sizes.percent', {percent: 150})
				}}</icon-button
			>
			<icon-button
				@click="changeScale(1.75)"
				:icon="fontScale === 1.75 ? 'check' : 'empty'"
				>{{
					$t('components.fontPicker.sizes.percent', {percent: 175})
				}}</icon-button
			>
			<icon-button
				@click="changeScale(2)"
				:icon="fontScale === 2 ? 'check' : 'empty'"
				>{{
					$t('components.fontPicker.sizes.percent', {percent: 200})
				}}</icon-button
			>
			<icon-button
				@click="toggleCustomScalePrompt"
				:icon="isCustomFontScale ? 'check' : 'empty'"
				label="common.custom"
			/>
		</dropdown-button>
		<prompt-modal
			:default-value="fontFamily.startsWith('var(') ? '' : fontFamily"
			dom-id="font-picker-custom-family"
			@cancel="toggleCustomFamilyPrompt"
			:detail="$t('components.fontPicker.customFamilyDetail')"
			:message="$t('components.fontPicker.customFamilyPrompt')"
			@submit="onSubmitCustomFamily"
			:visible="customFamilyPromptVisible"
		>
		</prompt-modal>
		<prompt-modal
			:default-value="fontScale === -1 ? '100' : (fontScale * 100).toString()"
			dom-id="font-picker-custom-scale"
			@cancel="toggleCustomScalePrompt"
			:detail="$t('components.fontPicker.customScaleDetail')"
			:message="$t('components.fontPicker.customScalePrompt')"
			@submit="onSubmitCustomScale"
			:visible="customScalePromptVisible"
		>
		</prompt-modal>
	</div>
</template>

<script>
import DropdownButton from './dropdown-button';
import IconButton from './icon-button';
import PromptModal from '../modal/prompt-modal';
import './font-picker.css';

export default {
	components: {DropdownButton, IconButton, PromptModal},
	computed: {
		isCustomFont() {
			return ![
				'var(--font-monospaced)',
				'var(--font-serif)',
				'var(--font-system)'
			].includes(this.fontFamily);
		},
		isCustomFontScale() {
			return ![-1, 0.8, 0.9, 1, 1.25, 1.5, 1.75, 2].includes(this.fontScale);
		}
	},
	data() {
		return {customFamilyPromptVisible: false, customScalePromptVisible: false};
	},
	methods: {
		changeFamily(fontFamily) {
			this.$emit('change', {fontFamily, fontScale: this.fontScale});
		},
		changeScale(fontScale) {
			this.$emit('change', {fontScale, fontFamily: this.fontFamily});
		},
		onSubmitCustomFamily(fontFamily) {
			this.changeFamily(fontFamily);
			this.toggleCustomFamilyPrompt();
		},
		onSubmitCustomScale(fontScale) {
			this.changeScale(fontScale / 100);
			this.toggleCustomScalePrompt();
		},
		toggleCustomFamilyPrompt() {
			this.customFamilyPromptVisible = !this.customFamilyPromptVisible;
		},
		toggleCustomScalePrompt() {
			this.customScalePromptVisible = !this.customScalePromptVisible;
		}
	},
	name: 'font-picker',
	props: {
		fontFamily: {required: true, type: String},
		fontScale: {required: true, type: Number}
	}
};
</script>
