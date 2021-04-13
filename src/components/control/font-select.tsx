import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {MenuButton} from './menu-button';
import {PromptModal} from '../modal/prompt-modal';

const families = ['var(--font-monospaced)', 'var(--font-system)'];
const scales = [0.8, 0.9, 1, 1.25, 1.5, 2];

export interface FontSelectProps {
	fontFamily: string;
	fontScale: number;
	onChangeFamily: (value: string) => void;
	onChangeScale: (value: number) => void;
}

export const FontSelect: React.FC<FontSelectProps> = props => {
	const {fontFamily, fontScale, onChangeFamily, onChangeScale} = props;
	const [customFamily, setCustomFamily] = React.useState('');
	const [familyModalOpen, setFamilyModalOpen] = React.useState(false);
	const [customScale, setCustomScale] = React.useState('');
	const [scaleModalOpen, setScaleModalOpen] = React.useState(false);
	const {t} = useTranslation();

	// TODO: custom value validation

	function toggleFamilyModal() {
		if (!familyModalOpen) {
			setCustomFamily(fontFamily.startsWith('var(') ? '' : fontFamily);
		}

		setFamilyModalOpen(open => !open);
	}

	function handleFamilySubmit() {
		onChangeFamily(customFamily);
		toggleFamilyModal();
	}

	function toggleScaleModal() {
		if (!scaleModalOpen) {
			setCustomScale((fontScale * 100).toString());
		}

		setScaleModalOpen(open => !open);
	}

	function handleScaleSubmit() {
		onChangeScale(parseInt(customScale) / 100);
		toggleScaleModal();
	}

	return (
		<>
			<span className="font-select">
				<MenuButton
					icon="type"
					items={[
						{
							checked: fontFamily === 'var(--font-monospaced)',
							label: t('components.fontSelect.fonts.monospaced'),
							onClick: () => onChangeFamily('var(--font-monospaced)')
						},
						{
							checked: fontFamily === 'var(--font-system)',
							label: t('components.fontSelect.fonts.system'),
							onClick: () => onChangeFamily('var(--font-system)')
						},
						{
							checked: !families.includes(fontFamily),
							label: t('common.custom'),
							onClick: toggleFamilyModal
						}
					]}
					label={t('components.fontSelect.font')}
				/>
				<MenuButton
					icon="type-size"
					items={[
						...scales.map(scale => ({
							checked: fontScale === scale,
							label: t('components.fontSelect.sizes.percent', {
								percent: scale * 100
							}),
							onClick: () => onChangeScale(scale)
						})),
						{
							checked: !scales.includes(fontScale),
							label: t('common.custom'),
							onClick: toggleScaleModal
						}
					]}
					label={t('components.fontSelect.fontSize')}
				/>
			</span>
			<PromptModal
				detail={t('components.fontSelect.customFamilyDetail')}
				domId="font-picker-custom-family"
				isOpen={familyModalOpen}
				message={t('components.fontSelect.customFamilyPrompt')}
				onCancel={toggleFamilyModal}
				onChange={e => setCustomFamily(e.target.value)}
				onSubmit={handleFamilySubmit}
				value={customFamily}
			/>
			<PromptModal
				detail={t('components.fontSelect.customSizeDetail')}
				domId="font-picker-custom-size"
				isOpen={scaleModalOpen}
				message={t('components.fontSelect.customSizePrompt')}
				onCancel={toggleScaleModal}
				onChange={e => setCustomScale(e.target.value)}
				onSubmit={handleScaleSubmit}
				value={customScale}
			/>
		</>
	);
};
