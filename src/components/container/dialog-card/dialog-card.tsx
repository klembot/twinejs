import * as React from 'react';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';
import {
	IconChevronDown,
	IconChevronUp,
	IconMaximize,
	IconMinimize,
	IconX
} from '@tabler/icons';
import {Card} from '../card';
import {IconButton} from '../../control/icon-button';
import {isTextEntry, useCommand} from '../../../hotkeys';
import './dialog-card.css';
import useErrorBoundary from 'use-error-boundary';
import {ErrorMessage} from '../../error';

export interface DialogCardProps {
	className?: string;
	collapsed: boolean;
	fixedSize?: boolean;
	headerLabel: string;
	headerDisplayLabel?: React.ReactNode;
	highlighted?: boolean;
	maximizable?: boolean;
	maximized?: boolean;
	onChangeCollapsed: (value: boolean) => void;
	onChangeHighlighted: (value: boolean) => void;
	onChangeMaximized: (value: boolean) => void;
	onClose: (event?: React.KeyboardEvent | React.MouseEvent) => void;
}

export const DialogCard: React.FC<DialogCardProps> = props => {
	const {
		children,
		className,
		collapsed,
		fixedSize,
		headerDisplayLabel,
		headerLabel,
		highlighted,
		maximizable,
		maximized,
		onChangeCollapsed,
		onChangeHighlighted,
		onChangeMaximized,
		onClose
	} = props;
	const {didCatch, ErrorBoundary, error} = useErrorBoundary();
	const {t} = useTranslation();
	const containerRef = React.useRef<HTMLDivElement>(null);

	// Every open dialog renders one of these, so the command has to be scoped to
	// this instance--otherwise which dialog maximizes would be up to
	// registration order.

	useCommand({
		allowInInput: true,
		// Works inside the keyboard shortcuts list too--see Command.chrome.
		chrome: true,
		element: containerRef,
		enabled: !!maximizable,
		id: 'dialog.maximize',
		label: t('hotkeys.commands.dialog.maximize'),
		run: () => onChangeMaximized(!maximized),
		scope: 'dialog'
	});

	// Maximizing changes the element structure around this dialog (see
	// <Dialogs>), so React remounts it and whatever had focus is destroyed,
	// leaving focus on the body -- where this dialog's shortcuts no longer
	// resolve. Take focus back, but only when it was orphaned like that: child
	// effects run first, so a dialog that focuses its own field keeps it.

	React.useEffect(() => {
		if (document.activeElement === document.body) {
			containerRef.current?.focus();
		}
	}, []);

	React.useEffect(() => {
		if (error) {
			console.error(error);
		}
	}, [error]);

	React.useEffect(() => {
		if (highlighted) {
			const timeout = window.setTimeout(() => onChangeHighlighted(false), 400);

			return () => window.clearTimeout(timeout);
		}
	}, [highlighted, onChangeHighlighted]);

	const calcdClassName = classNames('dialog-card', className, {
		collapsed,
		highlighted,
		'fixed-size': fixedSize,
		maximized
	});

	function handleKeyDown(event: React.KeyboardEvent) {
		if (event.key !== 'Escape') {
			return;
		}

		// Escape steps out one level rather than always closing. If the user is
		// typing, it leaves the field and puts focus on the dialog itself, which
		// is also what makes this dialog's shortcuts reachable. Pressing it again
		// closes, as it always did.

		const focused = document.activeElement;

		if (
			isTextEntry(focused) &&
			containerRef.current?.contains(focused) &&
			focused !== containerRef.current
		) {
			(focused as HTMLElement).blur();
			containerRef.current.focus();
			event.stopPropagation();
			return;
		}

		onClose(event);
	}

	// tabIndex on the container makes it focusable, so that Escape can move
	// focus here out of a text field. Without it the focus() call above does
	// nothing and focus falls to the body, where this dialog's shortcuts no
	// longer resolve.

	return (
		<div
			aria-label={headerLabel}
			role="dialog"
			className={calcdClassName}
			data-hotkey-scope="dialog"
			onKeyDown={handleKeyDown}
			ref={containerRef}
			tabIndex={-1}
		>
			<Card floating>
				<h2>
					<div className="dialog-card-header">
						{headerDisplayLabel ?? headerLabel}
					</div>
					<div className="dialog-card-header-controls">
						{maximizable && (
							<IconButton
								icon={maximized ? <IconMinimize /> : <IconMaximize />}
								iconOnly
								label={
									maximized ? t('common.unmaximize') : t('common.maximize')
								}
								onClick={() => onChangeMaximized(!maximized)}
								tooltipPosition="bottom"
							/>
						)}
						<IconButton
							icon={collapsed ? <IconChevronUp /> : <IconChevronDown />}
							iconOnly
							label={collapsed ? t('common.expand') : t('common.collapse')}
							onClick={() => onChangeCollapsed(!collapsed)}
							tooltipPosition="bottom"
						/>
						<IconButton
							icon={<IconX />}
							iconOnly
							label={t('common.close')}
							onClick={onClose}
							tooltipPosition="bottom"
						/>
					</div>
				</h2>
				{didCatch ? (
					<ErrorMessage>
						{t('components.dialogCard.contentsCrashed')}
					</ErrorMessage>
				) : (
					<ErrorBoundary>{!collapsed && children}</ErrorBoundary>
				)}
			</Card>
		</div>
	);
};
