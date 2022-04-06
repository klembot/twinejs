import {IconEye, IconFileText, IconPlayerPlay, IconTool} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next/';
import {ButtonBar} from '../components/container/button-bar';
import {IconButton} from '../components/control/icon-button';
import {storyFileName} from '../electron/shared';
import {Story} from '../store/stories';
import {usePublishing} from '../store/use-publishing';
import {useStoryLaunch} from '../store/use-story-launch';
import {saveHtml} from '../util/save-html';

export interface BuildActionsProps {
	story?: Story;
}

export const BuildActions: React.FC<BuildActionsProps> = ({story}) => {
	const {publishStory} = usePublishing();
	const {playStory, proofStory, testStory} = useStoryLaunch();
	const {t} = useTranslation();

	async function handlePublishFile() {
		if (!story) {
			throw new Error('No story provided to publish');
		}

		saveHtml(await publishStory(story.id), storyFileName(story));
	}

	return (
		<ButtonBar>
			<IconButton
				disabled={!story}
				icon={<IconTool />}
				label={t('routeActions.build.test')}
				onClick={story ? () => testStory(story.id) : () => {}}
			/>
			<IconButton
				disabled={!story}
				icon={<IconPlayerPlay />}
				label={t('routeActions.build.play')}
				onClick={story ? () => playStory(story.id) : () => {}}
			/>
			<IconButton
				disabled={!story}
				icon={<IconEye />}
				label={t('routeActions.build.proof')}
				onClick={story ? () => proofStory(story?.id) : () => {}}
			/>
			<IconButton
				disabled={!story}
				icon={<IconFileText />}
				label={t('routeActions.build.publishToFile')}
				onClick={handlePublishFile}
			/>
		</ButtonBar>
	);
};
