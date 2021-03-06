import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconDots} from '@tabler/icons';
import {MenuButton} from '../../../components/control/menu-button';
import {
	selectAllPassages,
	Story,
	useStoriesContext
} from '../../../store/stories';
import {usePublishing} from '../../../store/use-publishing';
import {useStoryLaunch} from '../../../store/use-story-launch';
import {storyFileName} from '../../../electron/shared';
import {saveHtml} from '../../../util/save-html';
import {
	AppPrefsDialog,
	PassageTagsDialog,
	StoryJavaScriptDialog,
	StorySearchDialog,
	StoryInfoDialog,
	StoryStylesheetDialog,
	useDialogsContext
} from '../../../dialogs';

export interface MoreMenuProps {
	story: Story;
}

export const MoreMenu: React.FC<MoreMenuProps> = props => {
	const {story} = props;
	const {dispatch: dialogsDispatch} = useDialogsContext();
	const {dispatch: storiesDispatch} = useStoriesContext();
	const {proofStory} = useStoryLaunch();
	const {publishStory} = usePublishing();
	const {t} = useTranslation();

	async function handlePublishFile() {
		saveHtml(await publishStory(story.id), storyFileName(story));
	}

	return (
		<MenuButton
			icon={<IconDots />}
			items={[
				{
					label: t('routes.storyEdit.topBar.findAndReplace'),
					onClick: () =>
						dialogsDispatch({
							type: 'addDialog',
							component: StorySearchDialog,
							props: {storyId: story.id}
						})
				},
				{
					label: t('routes.storyEdit.topBar.selectAllPassages'),
					onClick: () => storiesDispatch(selectAllPassages(story))
				},
				{
					label: t('routes.storyEdit.topBar.passageTags'),
					onClick: () =>
						dialogsDispatch({
							type: 'addDialog',
							component: PassageTagsDialog,
							props: {storyId: story.id}
						})
				},
				{separator: true},
				{
					label: t('routes.storyEdit.topBar.publishToFile'),
					onClick: handlePublishFile
				},
				{
					label: t('routes.storyEdit.topBar.proofStory'),
					onClick: () => proofStory(story.id)
				},
				{separator: true},
				{
					label: t('routes.storyEdit.topBar.storyInfo'),
					onClick: () =>
						dialogsDispatch({
							type: 'addDialog',
							component: StoryInfoDialog,
							props: {storyId: story.id}
						})
				},
				{
					label: t('routes.storyEdit.topBar.editJavaScript'),
					onClick: () =>
						dialogsDispatch({
							type: 'addDialog',
							component: StoryJavaScriptDialog,
							props: {storyId: story.id}
						})
				},
				{
					label: t('routes.storyEdit.topBar.editStylesheet'),
					onClick: () =>
						dialogsDispatch({
							type: 'addDialog',
							component: StoryStylesheetDialog,
							props: {storyId: story.id}
						})
				},
				{separator: true},
				{
					label: t('common.preferences'),
					onClick: () =>
						dialogsDispatch({
							type: 'addDialog',
							component: AppPrefsDialog
						})
				}
			]}
			label={t('common.more')}
		/>
	);
};
