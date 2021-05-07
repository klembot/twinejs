import * as React from 'react';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';
import {IconChevronDown} from '@tabler/icons';
import {MenuButton} from '../control/menu-button';
import {TagModal} from './tag-modal';
import {Color} from '../../util/color';
import './tag-button.css';

export interface TagButtonProps {
	color?: Color;
	name: string;
	onDelete: () => void;
	onEdit: (name: string, color: Color) => void;
}

export const TagButton: React.FC<TagButtonProps> = props => {
	const [editColor, setEditColor] = React.useState<Color>('none');
	const [editName, setEditName] = React.useState(props.name);
	const [modalOpen, setModalOpen] = React.useState(false);
	const {t} = useTranslation();

	function handleEdit() {
		props.onEdit(editName, editColor);
		setModalOpen(false);
	}

	function openModal() {
		setEditName(props.name);
		setEditColor(props.color ?? 'none');
		setModalOpen(true);
	}

	return (
		<span className={classNames('tag-button', `color-${props.color}`)}>
			<MenuButton
				icon={<IconChevronDown />}
				iconPosition="end"
				items={[
					{
						label: t('common.edit'),
						onClick: openModal
					},
					{
						label: t('common.delete'),
						onClick: props.onDelete
					}
				]}
				label={props.name}
			/>
			<TagModal
				color={editColor}
				detail={t('passageEdit.tagToolbar.editTagDetail')}
				isOpen={modalOpen}
				message={t('passageEdit.tagToolbar.editTagHeader')}
				name={editName}
				onChangeName={setEditName}
				onChangeColor={setEditColor}
				onCancel={() => setModalOpen(false)}
				onSubmit={() => handleEdit()}
			/>
		</span>
	);
};
