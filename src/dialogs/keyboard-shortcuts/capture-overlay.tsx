import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconCheck, IconX} from '@tabler/icons';
import {ButtonBar} from '../../components/container/button-bar';
import {Card, CardContent} from '../../components/container/card';
import {IconButton} from '../../components/control/icon-button';
import {
	eventToKeyString,
	KeyChip,
	normalizeKeyString,
	usesReservedSuperKey
} from '../../hotkeys';
import {Platform} from '../../util/platform';
import {ShortcutRow} from './shortcut-rows';

export interface CaptureOverlayProps {
	/**
	 * Add the captured key to the command's existing bindings rather than
	 * replacing them.
	 */
	adding?: boolean;
	onCancel: () => void;
	onSave: (keyString: string) => void;
	platform: Platform;
	row: ShortcutRow;
	/**
	 * All rows, so that we can warn about a key that's already in use before
	 * the user commits to it.
	 */
	rows: ShortcutRow[];
	scopeName: (scope: string) => string;
}

export const CaptureOverlay: React.FC<CaptureOverlayProps> = props => {
	const {adding, onCancel, onSave, platform, row, rows, scopeName} = props;
	const [captured, setCaptured] = React.useState<string>();
	const containerRef = React.useRef<HTMLDivElement>(null);
	const {t} = useTranslation();

	React.useEffect(() => {
		containerRef.current?.focus();
	}, []);

	function handleKeyDown(event: React.KeyboardEvent) {
		event.preventDefault();
		event.stopPropagation();

		const keyString = eventToKeyString(event.nativeEvent, platform);

		if (!keyString) {
			return;
		}

		if (keyString === 'escape') {
			onCancel();
			return;
		}

		if (keyString === 'enter' && captured) {
			onSave(captured);
			return;
		}

		setCaptured(keyString);
	}

	// Warn, don't block: shadowing a binding in one scope can be exactly what
	// the user wants, and the resolution rule is stated right here.

	const conflictsWith = captured
		? rows.filter(
				other =>
					other.id !== row.id &&
					other.scopes.some(scope => row.scopes.includes(scope)) &&
					other.bindings.some(
						binding => normalizeKeyString(binding, platform) === captured
					)
			)
		: [];

	return (
		<div
			className="capture-overlay"
			onKeyDown={handleKeyDown}
			ref={containerRef}
			tabIndex={-1}
		>
			<Card floating>
				<CardContent>
					<p className="capture-prompt">
						{t('dialogs.keyboardShortcuts.capture.prompt', {
							command: row.label
						})}
					</p>
					<p className="capture-key">
						{captured ? (
							<KeyChip keyString={captured} platform={platform} />
						) : (
							<span className="capture-waiting">
								{t('dialogs.keyboardShortcuts.capture.waiting')}
							</span>
						)}
					</p>
					{conflictsWith.map(other => (
						<p className="capture-conflict" key={other.id}>
							{t('dialogs.keyboardShortcuts.capture.conflict', {
								command: other.label,
								scope: scopeName(
									other.scopes.find(scope => row.scopes.includes(scope)) ??
										other.scopes[0]
								)
							})}
						</p>
					))}
					{captured && usesReservedSuperKey(captured, platform) && (
						<p className="capture-conflict">
							{t('dialogs.keyboardShortcuts.capture.superReserved')}
						</p>
					)}
					<p className="capture-scope">
						{t('dialogs.keyboardShortcuts.capture.scope', {
							scope: row.scopes.map(scopeName).join(', ')
						})}
					</p>
				</CardContent>
				<ButtonBar>
					<IconButton
						disabled={!captured}
						icon={<IconCheck />}
						label={t(
							adding
								? 'dialogs.keyboardShortcuts.capture.add'
								: 'dialogs.keyboardShortcuts.capture.save'
						)}
						onClick={() => captured && onSave(captured)}
						variant="primary"
					/>
					<IconButton
						icon={<IconX />}
						label={t('common.cancel')}
						onClick={onCancel}
					/>
				</ButtonBar>
			</Card>
		</div>
	);
};
