import * as React from 'react';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';
import {Card} from '../container/card';
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
				<Card>
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
				</Card>
			</DropdownButton>
		</span>
	);
};
