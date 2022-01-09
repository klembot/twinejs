import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconWriting} from '@tabler/icons';
import {PromptButton} from '../control/prompt-button';
import {Passage, Story} from '../../store/stories';
import {IconButton} from '../control/icon-button';

const DisabledRenamePassageButton: React.FC = () => {
	const {t} = useTranslation();

	return (
		<IconButton disabled icon={<IconWriting />} label={t('common.rename')} />
	);
};

export interface EnabledRenamePassageButtonProps {
	onRename: (value: string) => void;
	passage: Passage;
	story: Story;
}

export const EnabledRenamePassageButton: React.FC<EnabledRenamePassageButtonProps> = props => {
	const {onRename, passage, story} = props;
	const [newName, setNewName] = React.useState(passage.name);
	const {t} = useTranslation();

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
	passage?: Passage;
}

export const RenamePassageButton: React.FC<RenamePassageButtonProps> = props => {
	if (props.passage) {
		return (
			<EnabledRenamePassageButton
				{...(props as EnabledRenamePassageButtonProps)}
			/>
		);
	}

	return <DisabledRenamePassageButton />;
};