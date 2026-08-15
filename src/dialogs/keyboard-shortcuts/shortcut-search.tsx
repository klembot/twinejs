import {IconKeyboard, IconX} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../components/control/icon-button';
import {TextInput} from '../../components/control/text-input';
import {eventToKeyString, KeyChip} from '../../hotkeys';
import {Platform} from '../../util/platform';

export interface ShortcutSearchProps {
	onChangeRecordedKey: (value?: string) => void;
	onChangeSearch: (value: string) => void;
	platform: Platform;
	recordedKey?: string;
	search: string;
}

/**
 * The search field at the top of the shortcuts dialog. It has two modes:
 * ordinary text search, and "record keys", where pressing a combination filters
 * to whatever is bound to it--the fastest way to answer "what does this key
 * do?" and "is this key free?"
 */
export const ShortcutSearch: React.FC<ShortcutSearchProps> = props => {
	const {onChangeRecordedKey, onChangeSearch, platform, recordedKey, search} =
		props;
	const [recording, setRecording] = React.useState(false);
	const {t} = useTranslation();

	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (!recording) {
			return;
		}

		// Swallow everything, including Escape--otherwise the dialog would close
		// as soon as the user tried to clear what they'd recorded.

		event.preventDefault();
		event.stopPropagation();

		const keyString = eventToKeyString(event.nativeEvent, platform);

		if (!keyString) {
			// A modifier on its own. Nothing to record yet.
			return;
		}

		if (keyString === 'escape') {
			if (recordedKey) {
				onChangeRecordedKey(undefined);
			} else {
				setRecording(false);
			}

			return;
		}

		onChangeRecordedKey(keyString);
	}

	function toggleRecording() {
		if (recording) {
			onChangeRecordedKey(undefined);
		}

		setRecording(!recording);
	}

	return (
		<div className="shortcut-search">
			<TextInput
				onChange={event => onChangeSearch(event.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={t(
					recording
						? 'dialogs.keyboardShortcuts.recordPlaceholder'
						: 'dialogs.keyboardShortcuts.searchPlaceholder'
				)}
				type="search"
				value={recording ? '' : search}
			>
				{t('dialogs.keyboardShortcuts.search')}
			</TextInput>
			{recordedKey && (
				<span className="recorded-key">
					<KeyChip keyString={recordedKey} platform={platform} />
					<IconButton
						icon={<IconX />}
						iconOnly
						label={t('dialogs.keyboardShortcuts.clearRecordedKey')}
						onClick={() => onChangeRecordedKey(undefined)}
						tooltipPosition="bottom"
					/>
				</span>
			)}
			<IconButton
				icon={<IconKeyboard />}
				iconOnly
				label={t('dialogs.keyboardShortcuts.recordKeys')}
				onClick={toggleRecording}
				selectable
				selected={recording}
				tooltipPosition="bottom"
			/>
		</div>
	);
};
