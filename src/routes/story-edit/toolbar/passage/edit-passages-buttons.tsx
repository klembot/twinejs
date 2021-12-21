import {IconEdit} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {PassageEditDialog, useDialogsContext} from '../../../../dialogs';
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
		dispatch(dispatch =>
			passages.forEach(passage =>
				dispatch({
					type: 'addDialog',
					component: PassageEditDialog,
					props: {passageId: passage.id, storyId: story.id}
				})
			)
		);
	}

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
