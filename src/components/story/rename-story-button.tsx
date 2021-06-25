import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconWriting} from '@tabler/icons';
import {PromptButton} from '../control/prompt-button';
import {storyFileName} from '../../electron/shared';
import {Story} from '../../store/stories';

export interface RenameStoryButtonProps {
	existingStories: Story[];
	onRename: (value: string) => void;
	story: Story;
}

export const RenameStoryButton: React.FC<RenameStoryButtonProps> = props => {
	const {existingStories, onRename, story} = props;
	const [newName, setNewName] = React.useState(story.name);
	const {t} = useTranslation();

	function validate(name: string) {
		if (name.trim() === '') {
			return {
				message: t('components.renameStoryButton.emptyName'),
				valid: false
			};
		}

		if (
			existingStories.some(
				s =>
					s.id !== story.id &&
					storyFileName(s) === storyFileName({...story, name})
			)
		) {
			return {
				message: t('components.renameStoryButton.nameAlreadyUsed'),
				valid: false
			};
		}

		return {valid: true};
	}

	return (
		<PromptButton
			icon={<IconWriting />}
			label={t('common.rename')}
			onChange={event => setNewName(event.target.value)}
			onSubmit={onRename}
			prompt={t('common.renamePrompt', {name: story.name})}
			validate={validate}
			value={newName}
		/>
	);
};
