import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {Card, CardBody, CardHeader} from '../container/card';
import {IconButton} from '../control/icon-button';
import './editor-card.css';

export interface EditorCardProps {
	collapsed: boolean;
	headerLabel: string;
	onChangeCollapsed: (value: boolean) => void;
	onClose: () => void;
}

export const EditorCard: React.FC<EditorCardProps> = props => {
	const {children, collapsed, headerLabel, onChangeCollapsed, onClose} = props;
	const {t} = useTranslation();

	return (
		<div className="editor-card">
			<Card>
				<CardHeader>
					<div className="editor-card-header">
						<IconButton
							icon={collapsed ? 'chevron-right' : 'chevron-down'}
							label={headerLabel}
							onClick={() => onChangeCollapsed(!collapsed)}
						/>
					</div>
					<div className="editor-card-header-controls">
						<IconButton
							icon="x"
							iconOnly
							label={t('common.close')}
							onClick={onClose}
						/>
					</div>
				</CardHeader>
				{!collapsed && <CardBody>{children}</CardBody>}
			</Card>
		</div>
	);
};
