import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {TextInput} from './text-input';
import {TextSelect} from './text-select';
import './font-select.css';

const families = ['var(--font-monospaced)', 'var(--font-system)'];
const scales = [0.8, 0.9, 1, 1.25, 1.5, 2];

export interface FontSelectProps {
	familyLabel: string;
	fontFamily: string;
	fontScale: number;
	onChangeFamily: (value: string) => void;
	onChangeScale: (value: number) => void;
	scaleLabel: string;
}

export const FontSelect: React.FC<FontSelectProps> = props => {
	const {
		familyLabel,
		fontFamily,
		fontScale,
		onChangeFamily,
		onChangeScale,
		scaleLabel
	} = props;
	const [customScaleVisible, setCustomScaleVisible] = React.useState(
		!scales.includes(fontScale)
	);
	const [customFamilyVisible, setCustomFamilyVisible] = React.useState(
		!families.includes(fontFamily)
	);
	const [customFamily, setCustomFamily] = React.useState(fontFamily);
	const [customScale, setCustomScale] = React.useState(
		(fontScale * 100).toString()
	);
	const {t} = useTranslation();

	function handleFamilyChange(event: React.ChangeEvent<HTMLSelectElement>) {
		if (event.target.value === 'custom') {
			setCustomFamilyVisible(true);
			if (families.includes(customFamily)) {
				setCustomFamily('');
			}
		} else {
			setCustomFamilyVisible(false);
			onChangeFamily(event.target.value);
		}
	}

	function handleScaleChange(event: React.ChangeEvent<HTMLSelectElement>) {
		if (event.target.value === 'custom') {
			setCustomScaleVisible(true);
		} else {
			setCustomScaleVisible(false);
			onChangeScale(parseFloat(event.target.value));
		}
	}

	function handleCustomFamilyChange(
		event: React.ChangeEvent<HTMLInputElement>
	) {
		setCustomFamily(event.target.value);

		if (event.target.value.trim() !== '') {
			onChangeFamily(event.target.value);
		}
	}

	function handleCustomScaleChange(event: React.ChangeEvent<HTMLInputElement>) {
		setCustomScale(event.target.value);

		const value = parseInt(event.target.value);

		if (Number.isFinite(value)) {
			onChangeScale(value / 100);
		}
	}

	return (
		<div className="font-select">
			<TextSelect
				onChange={handleFamilyChange}
				options={[
					{
						label: t('components.fontSelect.fonts.system'),
						value: 'var(--font-system)'
					},
					{
						label: t('components.fontSelect.fonts.monospaced'),
						value: 'var(--font-monospaced)'
					},
					{
						label: t('common.custom'),
						value: 'custom'
					}
				]}
				value={customFamilyVisible ? 'custom' : fontFamily}
			>
				{familyLabel}
			</TextSelect>
			{customFamilyVisible && (
				<TextInput
					onChange={handleCustomFamilyChange}
					orientation="vertical"
					value={customFamily}
				>
					{t('components.fontSelect.customFamilyDetail')}
				</TextInput>
			)}
			<TextSelect
				onChange={handleScaleChange}
				options={[
					...scales.map(scale => ({
						label: t('components.fontSelect.percentage', {
							percent: scale * 100
						}),
						value: scale.toString()
					})),
					{label: t('common.custom'), value: 'custom'}
				]}
				value={customScaleVisible ? 'custom' : fontScale.toString()}
			>
				{scaleLabel}
			</TextSelect>
			{customScaleVisible && (
				<TextInput
					onChange={handleCustomScaleChange}
					orientation="vertical"
					value={customScale}
				>
					{t('components.fontSelect.customScaleDetail')}
				</TextInput>
			)}
		</div>
	);
};
