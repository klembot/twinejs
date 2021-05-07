import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {Color} from '../../util/color';
import {IconPlus} from '@tabler/icons';
import {IconButton} from '../control/icon-button';
import {TagModal} from './tag-modal';

export interface AddTagButtonProps {
	onCreate: (name: string, color: Color) => void;
}

export const AddTagButton: React.FC<AddTagButtonProps> = props => {
	const [modalOpen, setModalOpen] = React.useState(false);
	const [newColor, setNewColor] = React.useState<Color>('none');
	const [newName, setNewName] = React.useState('');
	const {t} = useTranslation();

	function openModal() {
		setNewColor('');
		setNewName('');
		setModalOpen(true);
	}

	// TODO: move localization strings

	return (
		<>
			<IconButton
				icon={<IconPlus />}
				label={t('common.tag')}
				onClick={openModal}
			/>
			<TagModal
				color={newColor}
				isOpen={modalOpen}
				message={t('passageEdit.tagToolbar.addTagHeader')}
				name={newName}
				onChangeName={setNewName}
				onChangeColor={setNewColor}
				onCancel={() => setModalOpen(false)}
				onSubmit={() => props.onCreate(newName, newColor)}
			/>
		</>
	);
};
