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
import {storyFilename} from '../../../util/publish';
import {saveHtml} from '../../../util/save-html';
import {
	AppPrefsDialog,
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
		saveHtml(await publishStory(story.id), storyFilename(story));
	}

	return (
		<MenuButton
			icon={<IconDots />}
			items={[
				{
					label: t('storyEdit.topBar.findAndReplace'),
					onClick: () =>
						dialogsDispatch({
							type: 'addDialog',
							component: StorySearchDialog,
							props: {storyId: story.id}
						})
				},
				{
					label: t('storyEdit.topBar.selectAllPassages'),
					onClick: () => storiesDispatch(selectAllPassages(story))
				},
				{separator: true},
				{
					label: t('storyEdit.topBar.publishToFile'),
					onClick: handlePublishFile
				},
				{
					label: t('storyEdit.topBar.proofStory'),
					onClick: () => proofStory(story.id)
				},
				{separator: true},
				{
					label: t('storyEdit.topBar.storyInfo'),
					onClick: () =>
						dialogsDispatch({
							type: 'addDialog',
							component: StoryInfoDialog,
							props: {storyId: story.id}
						})
				},
				{
					label: t('storyEdit.topBar.editJavaScript'),
					onClick: () =>
						dialogsDispatch({
							type: 'addDialog',
							component: StoryJavaScriptDialog,
							props: {storyId: story.id}
						})
				},
				{
					label: t('storyEdit.topBar.editStylesheet'),
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
