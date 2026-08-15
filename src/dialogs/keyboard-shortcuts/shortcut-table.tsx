import {
	IconAlertTriangle,
	IconInfoCircle,
	IconLock,
	IconPlus,
	IconRotate,
	IconTrash,
	IconWriting
} from '@tabler/icons';
import classNames from 'classnames';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../components/control/icon-button';
import {KeyChip} from '../../hotkeys';
import {Platform} from '../../util/platform';
import {ShortcutRow} from './shortcut-rows';

export interface ShortcutTableProps {
	onAdd: (row: ShortcutRow) => void;
	onEdit: (row: ShortcutRow) => void;
	onReset: (row: ShortcutRow) => void;
	onUnbind: (row: ShortcutRow) => void;
	platform: Platform;
	rows: ShortcutRow[];
	scopeName: (scope: string) => string;
}

export const ShortcutTable: React.FC<ShortcutTableProps> = props => {
	const {onAdd, onEdit, onReset, onUnbind, platform, rows, scopeName} = props;
	const {t} = useTranslation();

	if (rows.length === 0) {
		return (
			<p className="no-shortcuts">
				{t('dialogs.keyboardShortcuts.noMatchingCommands')}
			</p>
		);
	}

	return (
		<table className="shortcut-table">
			<thead>
				<tr>
					<th>{t('dialogs.keyboardShortcuts.columns.command')}</th>
					<th>{t('dialogs.keyboardShortcuts.columns.binding')}</th>
					<th className="shortcut-scope">
						{t('dialogs.keyboardShortcuts.columns.scope')}
					</th>
					<th>
						<span className="visually-hidden">
							{t('dialogs.keyboardShortcuts.columns.actions')}
						</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{rows.map(row => (
					<tr
						className={classNames('shortcut-row', {
							conflict: row.conflict,
							locked: row.locked,
							overridden: row.overridden
						})}
						key={row.id}
						onDoubleClick={() => !row.locked && onEdit(row)}
						tabIndex={0}
						onKeyDown={event => {
							if (row.locked) {
								return;
							}

							if (event.key === 'Enter') {
								event.preventDefault();
								onEdit(row);
							} else if (['Backspace', 'Delete'].includes(event.key)) {
								event.preventDefault();
								onUnbind(row);
							}
						}}
					>
						{/* The changed marker is a colored bar drawn by CSS, so the
						same fact has to reach anyone who can't see it as text. */}
						<td
							className="shortcut-command"
							title={
								row.overridden
									? t('dialogs.keyboardShortcuts.source.user')
									: undefined
							}
						>
							{row.conflict && (
								<IconAlertTriangle
									aria-label={t('dialogs.keyboardShortcuts.conflictWarning')}
								/>
							)}
							{row.locked && (
								<IconLock
									aria-label={t('dialogs.keyboardShortcuts.lockedByAppMenu')}
								/>
							)}
							{!row.conflict && !row.locked && row.shadowedBy && (
								<IconInfoCircle
									aria-label={t('dialogs.keyboardShortcuts.shadowed', {
										scope: scopeName(row.shadowedBy)
									})}
								/>
							)}
							<span className="shortcut-label">{row.label}</span>
							{row.overridden && (
								<span className="screen-reader-only">
									{t('dialogs.keyboardShortcuts.source.user')}
								</span>
							)}
							{/* The scope repeats what the "Where It Works" column says.
							Only one of the two is ever shown: the column disappears when
							the dialog isn't maximized, and this line takes over. */}
							<span className="shortcut-meta">
								<span className="shortcut-id">{row.id}</span>
								<span className="shortcut-command-scope">
									{row.scopes.map(scopeName).join(', ')}
								</span>
							</span>
						</td>
						<td className="shortcut-binding">
							<span className="shortcut-binding-keys">
								{row.bindings.length === 0 ? (
									<span className="unbound">
										{t('dialogs.keyboardShortcuts.unbound')}
									</span>
								) : (
									row.bindings.map(binding => (
										<KeyChip
											key={binding}
											keyString={binding}
											platform={platform}
										/>
									))
								)}
							</span>
						</td>
						<td className="shortcut-scope">
							{row.scopes.map(scopeName).join(', ')}
						</td>
						<td className="shortcut-actions">
							<IconButton
								disabled={row.locked}
								icon={<IconWriting />}
								iconOnly
								label={t('dialogs.keyboardShortcuts.changeBinding')}
								onClick={() => onEdit(row)}
								tooltipPosition="left"
							/>
							<IconButton
								disabled={row.locked}
								icon={<IconPlus />}
								iconOnly
								label={t('dialogs.keyboardShortcuts.addBinding')}
								onClick={() => onAdd(row)}
								tooltipPosition="left"
							/>
							<IconButton
								disabled={row.locked || row.bindings.length === 0}
								icon={<IconTrash />}
								iconOnly
								label={t('dialogs.keyboardShortcuts.removeBinding')}
								onClick={() => onUnbind(row)}
								tooltipPosition="left"
							/>
							<IconButton
								disabled={!row.overridden}
								icon={<IconRotate />}
								iconOnly
								label={t('dialogs.keyboardShortcuts.resetBinding')}
								onClick={() => onReset(row)}
								tooltipPosition="left"
							/>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};
