import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconWriting} from '@tabler/icons';
import {PromptButton} from '../control/prompt-button';
import {Passage, Story} from '../../store/stories';
import {IconButton} from '../control/icon-button';
import {useCommand} from '../../hotkeys';

const DisabledRenamePassageButton: React.FC = () => {
	const {t} = useTranslation();

	return (
		<IconButton disabled icon={<IconWriting />} label={t('common.rename')} />
	);
};

export interface EnabledRenamePassageButtonProps {
	/**
	 * Scope the `passage.rename` command registers in. The story map toolbar
	 * and the passage editor both show this button, and each should respond to
	 * the shortcut when it has focus.
	 */
	hotkeyScope?: string | null;
	onRename: (value: string) => void;
	passage: Passage;
	story: Story;
}

export const EnabledRenamePassageButton: React.FC<EnabledRenamePassageButtonProps> = props => {
	const {hotkeyScope = 'story-map', onRename, passage, story} = props;
	const [newName, setNewName] = React.useState(passage.name);
	const [open, setOpen] = React.useState(false);
	const {t} = useTranslation();

	// F2 produces no character, so this is safe to allow while the passage
	// editor has focus.

	useCommand({
		allowInInput: true,
		id: 'passage.rename',
		label: t('common.rename'),
		run: () => setOpen(true),
		scope: hotkeyScope
	});

	function validate(name: string) {
		if (name.trim() === '') {
			return {
				message: t('components.renamePassageButton.emptyName'),
				valid: false
			};
		}

		if (story.passages.some(p => p.id !== passage.id && p.name === name)) {
			return {
				message: t('components.renamePassageButton.nameAlreadyUsed'),
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
			prompt={t('common.renamePrompt', {name: passage.name})}
			validate={validate}
			value={newName}
		/>
	);
};

export interface RenamePassageButtonProps
	extends Omit<EnabledRenamePassageButtonProps, 'passage'> {
	disabled?: boolean;
	passage?: Passage;
}

export const RenamePassageButton: React.FC<
	RenamePassageButtonProps
> = props => {
	if (!props.disabled && props.passage) {
		return (
			<EnabledRenamePassageButton
				{...(props as EnabledRenamePassageButtonProps)}
			/>
		);
	}

	return <DisabledRenamePassageButton />;
};