import {IconRotate} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {ButtonBar} from '../../components/container/button-bar';
import {CardContent} from '../../components/container/card';
import {
	DialogCard,
	DialogCardProps
} from '../../components/container/dialog-card';
import {CheckboxButton} from '../../components/control/checkbox-button';
import {IconButton} from '../../components/control/icon-button';
import {KEYBINDINGS_SCOPE, useHotkeysContext} from '../../hotkeys';
import {isElectronRenderer} from '../../util/is-electron';
import {CaptureOverlay} from './capture-overlay';
import {PlatformSelection, PlatformStrip} from './platform-strip';
import {
	filterRows,
	parseSearch,
	ShortcutRow,
	shortcutRows
} from './shortcut-rows';
import {ShortcutSearch} from './shortcut-search';
import {ShortcutTable} from './shortcut-table';
import './keyboard-shortcuts-dialog.css';

interface Editing {
	adding: boolean;
	row: ShortcutRow;
}

export const KeyboardShortcutsDialog: React.FC<
	Omit<DialogCardProps, 'headerLabel'>
> = props => {
	const {keymap, platform, resetAllBindings, setBinding} = useHotkeysContext();
	// The selection is what the user picked; `auto` resolves to the detected
	// platform so the dialog follows this computer unless told otherwise.

	const [platformSelection, setPlatformSelection] =
		React.useState<PlatformSelection>('auto');
	const displayPlatform =
		platformSelection === 'auto' ? platform : platformSelection;
	const [search, setSearch] = React.useState('');
	const [recordedKey, setRecordedKey] = React.useState<string>();
	const [editing, setEditing] = React.useState<Editing>();
	const [onlyConflicts, setOnlyConflicts] = React.useState(false);
	const [onlyModified, setOnlyModified] = React.useState(false);
	const [onlyUnbound, setOnlyUnbound] = React.useState(false);
	const {t} = useTranslation();

	const scopeName = React.useCallback(
		(scope: string) => t(`hotkeys.scopes.${scope}`),
		[t]
	);

	const {conflicts, rows} = React.useMemo(
		() =>
			shortcutRows(
				keymap,
				displayPlatform,
				id => t(`hotkeys.commands.${id}`),
				isElectronRenderer()
			),
		[displayPlatform, keymap, t]
	);

	const visibleRows = React.useMemo(() => {
		const filter = parseSearch(search);

		return filterRows(
			rows,
			{
				...filter,
				keyString: recordedKey,
				onlyConflicts: filter.onlyConflicts || onlyConflicts,
				onlyModified: filter.onlyModified || onlyModified,
				onlyUnbound: filter.onlyUnbound || onlyUnbound
			},
			displayPlatform,
			scopeName
		);
	}, [
		displayPlatform,
		onlyConflicts,
		onlyModified,
		onlyUnbound,
		recordedKey,
		rows,
		scopeName,
		search
	]);

	const modifiedCount = rows.filter(row => row.overridden).length;
	const unboundCount = rows.filter(row => row.bindings.length === 0).length;

	function handleSave(keyString: string) {
		if (!editing) {
			return;
		}

		setBinding(
			editing.row.id,
			editing.adding ? [...editing.row.bindings, keyString] : [keyString]
		);
		setEditing(undefined);
	}

	return (
		<DialogCard
			{...props}
			className="keyboard-shortcuts-dialog"
			headerLabel={t('dialogs.keyboardShortcuts.title')}
			maximizable
		>
			{/* While focus is in here, no other command may fire--otherwise
			looking up a shortcut would trigger it. */}
			<div className="keybindings-scope" data-hotkey-scope={KEYBINDINGS_SCOPE}>
				<CardContent>
					<div className="shortcut-controls">
						<ShortcutSearch
							onChangeRecordedKey={setRecordedKey}
							onChangeSearch={setSearch}
							platform={displayPlatform}
							recordedKey={recordedKey}
							search={search}
						/>
						<PlatformStrip
							detected={platform}
							onChange={setPlatformSelection}
							value={platformSelection}
						/>
						<ButtonBar>
							<CheckboxButton
								label={t('dialogs.keyboardShortcuts.filters.modified', {
									count: modifiedCount
								})}
								onChange={setOnlyModified}
								value={onlyModified}
							/>
							<CheckboxButton
								label={t('dialogs.keyboardShortcuts.filters.unbound', {
									count: unboundCount
								})}
								onChange={setOnlyUnbound}
								value={onlyUnbound}
							/>
							<CheckboxButton
								label={t('dialogs.keyboardShortcuts.filters.conflicts', {
									count: conflicts.length
								})}
								onChange={setOnlyConflicts}
								value={onlyConflicts}
							/>
							<IconButton
								disabled={modifiedCount === 0}
								icon={<IconRotate />}
								label={t('dialogs.keyboardShortcuts.resetAll')}
								onClick={resetAllBindings}
							/>
						</ButtonBar>
					</div>
					{/* The search and filters stay put; only the list scrolls. */}
					<div className="shortcut-table-scroll">
						<ShortcutTable
							onAdd={row => setEditing({adding: true, row})}
							onEdit={row => setEditing({adding: false, row})}
							onReset={row => setBinding(row.id, undefined)}
							onUnbind={row => setBinding(row.id, [])}
							platform={displayPlatform}
							rows={visibleRows}
							scopeName={scopeName}
						/>
					</div>
				</CardContent>
				{editing && (
					<CaptureOverlay
						adding={editing.adding}
						onCancel={() => setEditing(undefined)}
						onSave={handleSave}
						platform={displayPlatform}
						row={editing.row}
						rows={rows}
						scopeName={scopeName}
					/>
				)}
			</div>
		</DialogCard>
	);
};
