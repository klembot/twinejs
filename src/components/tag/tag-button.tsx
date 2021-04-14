import * as React from 'react';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';
import {MenuButton} from '../control/menu-button';
import {Color} from '../../util/color';
import './tag-button.css';

export interface TagButtonProps {
	color: Color;
	name: string;
	onDelete: () => void;
	onEdit: () => void;
}

export const TagButton: React.FC<TagButtonProps> = props => {
	const {t} = useTranslation();

	return (
		<span className={classNames('tag-button', `color-${props.color}`)}>
			<MenuButton
				icon="tag-nub"
				items={[
					{
						label: t('common.edit'),
						onClick: props.onEdit
					},
					{
						label: t('common.delete'),
						onClick: props.onDelete,
						variant: 'danger'
					}
				]}
				label={props.name}
			/>
		</span>
	);
};
