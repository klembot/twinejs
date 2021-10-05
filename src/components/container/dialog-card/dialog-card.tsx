import * as React from 'react';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';
import {IconChevronDown, IconChevronUp, IconX} from '@tabler/icons';
import {Card} from '../card';
import {IconButton} from '../../control/icon-button';
import './dialog-card.css';

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
	const {t} = useTranslation();

	const calcdClassName = classNames('dialog-card', className, {
		collapsed,
		'fixed-size': fixedSize
	});

	return (
		<div aria-label={headerLabel} role="dialog" className={calcdClassName}>
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
