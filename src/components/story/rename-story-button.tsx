import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconWriting} from '@tabler/icons';
import {PromptButton} from '../control/prompt-button';
import {storyFileName} from '../../electron/shared';
import {Story} from '../../store/stories';
import {IconButton} from '../control/icon-button';
import {useCommand} from '../../hotkeys';

// This is here because it's used in two places--the story list and the story
// info dialog.

const DisabledRenameStoryButton: React.FC = () => {
	const {t} = useTranslation();

	return (
		<IconButton disabled icon={<IconWriting />} label={t('common.rename')} />
	);
};

interface EnabledRenameStoryButtonProps {
	existingStories: Story[];
	/**
	 * Scope the `story.rename` command registers in. The story list toolbar and
	 * the story details dialog both show this button.
	 */
	hotkeyScope?: string | null;
	onRename: (value: string) => void;
	story: Story;
}

const EnabledRenameStoryButton: React.FC<EnabledRenameStoryButtonProps> = props => {
	const {
		existingStories,
		hotkeyScope = 'story-list',
		onRename,
		story
	} = props;
	const [newName, setNewName] = React.useState(story.name);
	const [open, setOpen] = React.useState(false);
	const {t} = useTranslation();

	useCommand({
		allowInInput: true,
		id: 'story.rename',
		label: t('common.rename'),
		run: () => setOpen(true),
		scope: hotkeyScope
	});

	React.useEffect(() => setNewName(story.name), [story]);

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
			onChangeOpen={setOpen}
			open={open}
			onChange={event => setNewName(event.target.value)}
			onSubmit={onRename}
			prompt={t('common.renamePrompt', {name: story.name})}
			validate={validate}
			value={newName}
		/>
	);
};

export interface RenameStoryButtonProps
	extends Omit<EnabledRenameStoryButtonProps, 'story'> {
	story?: Story;
}

export const RenameStoryButton: React.FC<RenameStoryButtonProps> = props => {
	if (props.story) {
		return (
			<EnabledRenameStoryButton {...(props as EnabledRenameStoryButtonProps)} />
		);
	}

	return <DisabledRenameStoryButton />;
};