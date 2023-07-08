import {IconX} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import useErrorBoundary from 'use-error-boundary';
import {IconButton} from '../../control/icon-button';
import {ErrorMessage} from '../../error';
import {Card} from '../card';
import './dialog-card.css';

export interface BackgroundDialogCardProps {
	headerDisplayLabel?: React.ReactNode;
	headerLabel: string;
	onClose: (event?: React.MouseEvent) => void;
	onRaise: () => void;
}

export const BackgroundDialogCard: React.FC<
	BackgroundDialogCardProps
> = props => {
	const {children, headerDisplayLabel, headerLabel, onClose, onRaise} = props;
	const {didCatch, ErrorBoundary, error} = useErrorBoundary();
	const {t} = useTranslation();

	React.useEffect(() => {
		if (error) {
			console.error(error);
		}
	}, [error]);

	return (
		<div aria-label={headerLabel} className="dialog-card background">
			<Card floating>
				<h2>
					<div className="dialog-card-header">
						<IconButton
							displayLabel={headerDisplayLabel}
							icon={null}
							label={headerLabel}
							onClick={onRaise}
						/>
					</div>
					<div className="dialog-card-header-controls">
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
					<ErrorBoundary>{children}</ErrorBoundary>
				)}
			</Card>
		</div>
	);
};
