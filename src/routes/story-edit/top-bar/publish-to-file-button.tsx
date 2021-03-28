import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../components/control/icon-button';
import {Story} from '../../../store/stories';
import {usePublishing} from '../../../store/use-publishing';
import {storyFilename} from '../../../util/publish';
import {saveHtml} from '../../../util/save-html';

export interface PublishToFileButtonProps {
	story: Story;
}

export const PublishToFileButton: React.FC<PublishToFileButtonProps> = ({
	story
}) => {
	const {publishStory} = usePublishing();
	const {t} = useTranslation();

	async function handleClick() {
		saveHtml(await publishStory(story.id), storyFilename(story));
	}

	return (
		<IconButton
			icon="download"
			label={t('storyEdit.topBar.publishToFile')}
			onClick={handleClick}
		/>
	);
};
