import {IconEdit} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {addPassageEditors, useDialogsContext} from '../../../../dialogs';
import {useCommand} from '../../../../hotkeys';
import {Passage, Story} from '../../../../store/stories';

export interface EditPassagesButtonProps {
	passages: Passage[];
	story: Story;
}

export const EditPassagesButton: React.FC<EditPassagesButtonProps> = props => {
	const {passages, story} = props;
	const {dispatch} = useDialogsContext();
	const {t} = useTranslation();

	function handleClick() {
		dispatch(
			addPassageEditors(
				story.id,
				passages.map(({id}) => id)
			)
		);
	}

	useCommand({
		enabled: passages.length > 0,
		id: 'passage.edit',
		label: t('hotkeys.commands.passage.edit'),
		run: handleClick,
		scope: 'story-map'
	});

	return (
		<IconButton
			disabled={passages.length === 0}
			icon={<IconEdit />}
			label={
				passages.length > 1
					? t('common.editCount', {count: passages.length})
					: t('common.edit')
			}
			onClick={handleClick}
		/>
	);
};
