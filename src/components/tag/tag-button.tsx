import * as React from 'react';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';
import {IconChevronDown} from '@tabler/icons';
import {MenuButton} from '../control/menu-button';
import {colors, Color} from '../../util/color';
import './tag-button.css';

export interface TagButtonProps {
	color?: Color;
	name: string;
	onChangeColor: (color: Color) => void;
	onRemove: () => void;
}

export const TagButton: React.FC<TagButtonProps> = props => {
	const {t} = useTranslation();

	return (
		<span className={classNames('tag-button', `color-${props.color}`)}>
			<MenuButton
				icon={<IconChevronDown />}
				iconPosition="end"
				items={[
					...colors.map(color => ({
						checkable: true,
						checked: color === 'none' ? !props.color : color === props.color,
						label: t(`colors.${color}`),
						onClick: () => props.onChangeColor(color)
					})),
					{
						separator: true
					},
					{
						label: t('common.remove'),
						onClick: props.onRemove
					}
				]}
				label={props.name}
			/>
		</span>
	);
};
