import * as React from 'react';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';
import {ButtonCard} from '../container/button-card';
import {DropdownButton} from '../control/dropdown-button';
import {IconButton} from '../control/icon-button';
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
			<DropdownButton icon="tag-nub" label={props.name}>
				<ButtonCard>
					<IconButton
						icon="edit"
						onClick={props.onEdit}
						label={t('common.edit')}
					/>
					<IconButton
						icon="trash-2"
						onClick={props.onDelete}
						label={t('common.delete')}
						variant="danger"
					/>
				</ButtonCard>
			</DropdownButton>
		</span>
	);
};
