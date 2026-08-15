import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {TextSelect} from '../../components/control/text-select';
import {Platform} from '../../util/platform';

/**
 * Which platform's keys to show. `auto` follows whatever platform was
 * detected, so a keymap looks right without the user choosing anything.
 */
export type PlatformSelection = Platform | 'auto';

export interface PlatformStripProps {
	/**
	 * The platform actually detected, as opposed to the one being shown.
	 */
	detected: Platform;
	onChange: (value: PlatformSelection) => void;
	value: PlatformSelection;
}

/**
 * Says in words which physical key `mod` means, and lets the user look at the
 * keymap as another platform sees it--useful for checking a keymap before
 * sharing it, or for following documentation written on a different OS.
 */
export const PlatformStrip: React.FC<PlatformStripProps> = props => {
	const {detected, onChange, value} = props;
	const {t} = useTranslation();
	const shown = value === 'auto' ? detected : value;

	return (
		<div className="platform-strip">
			<TextSelect
				onChange={event => onChange(event.target.value as PlatformSelection)}
				options={[
					{
						label: t('dialogs.keyboardShortcuts.platform.automatic', {
							platform: t(`dialogs.keyboardShortcuts.platform.${detected}`)
						}),
						value: 'auto'
					},
					{label: t('dialogs.keyboardShortcuts.platform.mac'), value: 'mac'},
					{
						label: t('dialogs.keyboardShortcuts.platform.windows'),
						value: 'windows'
					},
					{
						label: t('dialogs.keyboardShortcuts.platform.linux'),
						value: 'linux'
					}
				]}
				value={value}
			>
				{t('dialogs.keyboardShortcuts.platform.showing')}
			</TextSelect>
			<span className="platform-legend">
				{t(`dialogs.keyboardShortcuts.platform.legend.${shown}`)}
			</span>
			{/* Only warn when the user deliberately picked a platform this computer
			isn't--`auto` is never wrong. */}
			{value !== 'auto' && value !== detected && (
				<span className="platform-warning">
					{t('dialogs.keyboardShortcuts.platform.notThisPlatform')}
				</span>
			)}
		</div>
	);
};
