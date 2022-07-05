import * as React from 'react';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';
import {IconChevronDown, IconChevronUp, IconX} from '@tabler/icons';
import {Card} from '../card';
import {IconButton} from '../../control/icon-button';
import './dialog-card.css';
import useErrorBoundary from 'use-error-boundary';
import {ErrorMessage} from '../../error';

export interface DialogCardProps {
	className?: string;
	collapsed: boolean;
	fixedSize?: boolean;
	headerLabel: string;
	onChangeCollapsed: (value: boolean) => void;
	onClose: () => void;
}

export const DialogCard: React.FC<DialogCardProps> = props => {
	const {
		children,
		className,
		collapsed,
		fixedSize,
		headerLabel,
		onChangeCollapsed,
		onClose
	} = props;
	const {didCatch, ErrorBoundary, error} = useErrorBoundary();
	const {t} = useTranslation();

	React.useEffect(() => {
		if (error) {
			console.error(error);
		}
	}, [error]);

	const calcdClassName = classNames('dialog-card', className, {
		collapsed,
		'fixed-size': fixedSize
	});

	function handleKeyDown(event: React.KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}

	return (
		<div
			aria-label={headerLabel}
			role="dialog"
			className={calcdClassName}
			onKeyDown={handleKeyDown}
		>
			<Card floating>
				<h2>
					<div className="dialog-card-header">
						<IconButton
							icon={collapsed ? <IconChevronUp /> : <IconChevronDown />}
							label={headerLabel}
							onClick={() => onChangeCollapsed(!collapsed)}
						/>
					</div>
					<div className="dialog-card-header-controls">
						<IconButton
							icon={<IconX />}
							iconOnly
							label={t('common.close')}
							onClick={onClose}
							tooltipPosition="left"
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
