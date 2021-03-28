import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {ButtonCard} from '../container/button-card';
import {CheckboxButton} from './checkbox-button';
import {DropdownButton} from './dropdown-button';
import {PromptModal} from '../modal/prompt-modal';

const families = ['var(--font-monospaced)', 'var(--font-system)'];
const scales = [-1, 0.8, 0.9, 1, 1.25, 1.5, 2];

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
	const checkProps = {checkedIcon: 'check', uncheckedIcon: 'empty'};

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
				<DropdownButton
					icon="type"
					label={t('components.fontSelect.font')}
				>
					<ButtonCard>
						<CheckboxButton
							label={t('components.fontSelect.fonts.monospaced')}
							onChange={() =>
								onChangeFamily('var(--font-monospaced)')
							}
							value={fontFamily === 'var(--font-monospaced)'}
							{...checkProps}
						/>
						<CheckboxButton
							label={t('components.fontSelect.fonts.system')}
							onChange={() =>
								onChangeFamily('var(--font-system)')
							}
							value={fontFamily === 'var(--font-system)'}
							{...checkProps}
						/>
						<CheckboxButton
							label={t('common.custom')}
							onChange={toggleFamilyModal}
							value={!families.includes(fontFamily)}
							{...checkProps}
						/>
					</ButtonCard>
				</DropdownButton>
				<DropdownButton
					icon="type-size"
					label={t('components.fontSelect.fontSize')}
				>
					<ButtonCard>
						{scales.map(scale => (
							<CheckboxButton
								key={scale}
								label={
									scale === -1
										? t('components.fontSelect.sizes.auto')
										: t(
												'components.fontSelect.sizes.percent',
												{percent: scale * 100}
										  )
								}
								onChange={() => onChangeScale(scale)}
								value={fontScale === scale}
								{...checkProps}
							/>
						))}
						<CheckboxButton
							label={t('common.custom')}
							onChange={toggleScaleModal}
							value={!scales.includes(fontScale)}
							{...checkProps}
						/>
					</ButtonCard>
				</DropdownButton>
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
