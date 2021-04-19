import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {ButtonBar} from '../../../../components/container/button-bar';
import {IconButton} from '../../../../components/control/icon-button';
import {TagModal} from '../../../../components/tag/tag-modal';
import {
	addPassageTag,
	removePassageTag,
	renameTag,
	setTagColor,
	useStoriesContext,
	Passage,
	Story
} from '../../../../store/stories';
import {TagButton} from '../../../../components/tag/tag-button';
import {Color} from '../../../../util/color';

export interface TagToolbarProps {
	passage: Passage;
	story: Story;
}

// TODO: add explanation of what tags do

export const TagToolbar: React.FC<TagToolbarProps> = props => {
	const {passage, story} = props;
	const {dispatch} = useStoriesContext();
	const [newModalOpen, setNewModalOpen] = React.useState(false);
	const [newColor, setNewColor] = React.useState<Color>('none');
	const [newName, setNewName] = React.useState('');
	const [editModalOpen, setEditModalOpen] = React.useState(false);
	const [editColor, setEditColor] = React.useState<Color>('none');
	const [preEditName, setPreEditName] = React.useState('');
	const [editName, setEditName] = React.useState('');
	const {t} = useTranslation();

	function toggleNewModal() {
		if (!newModalOpen) {
			setNewColor('none');
			setNewName('');
		}

		setNewModalOpen(!newModalOpen);
	}

	function handleAddNewTag() {
		// TODO: make this a thunk

		dispatch(addPassageTag(story, passage, newName));
		dispatch(setTagColor(story, newName, newColor));
		toggleNewModal();
	}

	function openEditModal(name: string, color?: Color) {
		setPreEditName(name);
		setEditName(name);
		setEditColor(color ?? 'none');
		setEditModalOpen(true);
	}

	function handleRemoveTag(name: string) {
		dispatch(removePassageTag(story, passage, name));
	}

	function handleEditTag() {
		dispatch(renameTag(story, preEditName, editName));
		dispatch(setTagColor(story, editName, editColor));
		setEditModalOpen(false);
	}

	return (
		<>
			<ButtonBar orientation="horizontal">
				<IconButton
					icon="plus"
					label={t('common.tag')}
					onClick={toggleNewModal}
					variant="create"
				/>
				{props.passage.tags.map(tag => (
					<TagButton
						color={props.story.tagColors[tag] ?? 'none'}
						key={tag}
						name={tag}
						onDelete={() => handleRemoveTag(tag)}
						onEdit={() => openEditModal(tag, props.story.tagColors[tag])}
					/>
				))}
			</ButtonBar>
			<TagModal
				color={newColor}
				isOpen={newModalOpen}
				message={t('passageEdit.tagToolbar.addTagHeader')}
				name={newName}
				onChangeName={setNewName}
				onChangeColor={setNewColor}
				onCancel={toggleNewModal}
				onSubmit={handleAddNewTag}
			/>
			<TagModal
				color={editColor}
				detail={t('passageEdit.tagToolbar.editTagDetail')}
				isOpen={editModalOpen}
				message={t('passageEdit.tagToolbar.editTagHeader')}
				name={editName}
				onChangeName={setEditName}
				onChangeColor={setEditColor}
				onCancel={() => setEditModalOpen(false)}
				onSubmit={handleEditTag}
			/>
		</>
	);
};
