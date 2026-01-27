import {IconEdit} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {addPassageEditors, useDialogsContext} from '../../../../dialogs';
import {usePrefsContext} from '../../../../store/prefs';
import {
	addRelativeEditor,
	useRelativePassageEditorsContext
} from '../../../../store/relative-passage-editors';
import {deselectAllPassages, Passage, Story} from '../../../../store/stories';
import {useUndoableStoriesContext} from '../../../../store/undoable-stories';

export interface EditPassagesButtonProps {
	passages: Passage[];
	story: Story;
}

export const EditPassagesButton: React.FC<EditPassagesButtonProps> = props => {
	const {passages, story} = props;
	const {dispatch: dialogsDispatch} = useDialogsContext();
	const {dispatch: relativeDispatch} = useRelativePassageEditorsContext();
	const {dispatch: storiesDispatch} = useUndoableStoriesContext();
	const {prefs} = usePrefsContext();
	const {t} = useTranslation();

	function handleClick() {
		if (prefs.passageRelativePosition) {
			passages.forEach(passage => {
				relativeDispatch(addRelativeEditor(passage.id, story.id));
			});
			storiesDispatch(deselectAllPassages(story));
		} else {
			dialogsDispatch(
				addPassageEditors(
					story.id,
					passages.map(({id}) => id)
				)
			);
		}
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
