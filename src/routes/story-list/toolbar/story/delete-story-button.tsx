import {IconTrash} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {ConfirmButton} from '../../../../components/control/confirm-button';
import {deleteStory, Story, useStoriesContext} from '../../../../store/stories';
import {isElectronRenderer} from '../../../../util/is-electron';

export interface DeleteStoryButtonProps {
	story?: Story;
}

export const DeleteStoryButton: React.FC<DeleteStoryButtonProps> = ({
	story
}) => {
	// We need to store a local copy of the story name so that after it's deleted,
	// the prompt doesn't change as it transitions out.
	const [storyName, setStoryName] = React.useState(story?.name);
	const {dispatch} = useStoriesContext();
	const {t} = useTranslation();

	React.useEffect(() => {
		if (story?.name) {
			setStoryName(story.name);
		}
	}, [story?.name]);

	return (
		<ConfirmButton
			confirmIcon={<IconTrash />}
			confirmLabel={t('common.delete')}
			confirmVariant="danger"
			disabled={!story}
			icon={<IconTrash />}
			label={t('common.delete')}
			onConfirm={story ? () => dispatch(deleteStory(story)) : () => {}}
			prompt={t(
				`routes.storyList.toolbar.deleteStoryButton.warning.${
					isElectronRenderer() ? 'electron' : 'web'
				}`,
				{storyName}
			)}
		/>
	);
};
