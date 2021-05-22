import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconChevronDown, IconChevronUp, IconX} from '@tabler/icons';
import {Card, CardContent} from '../card';
import {IconButton} from '../../control/icon-button';
import './dialog-card.css';

export interface DialogCardProps {
	collapsed: boolean;
	headerLabel: string;
	onChangeCollapsed: (value: boolean) => void;
	onClose: () => void;
}

export const DialogCard: React.FC<DialogCardProps> = props => {
	const {children, collapsed, headerLabel, onChangeCollapsed, onClose} = props;
	const {t} = useTranslation();

	return (
		<div className="dialog-card">
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
						/>
					</div>
				</h2>
				{!collapsed && children}
			</Card>
		</div>
	);
};
