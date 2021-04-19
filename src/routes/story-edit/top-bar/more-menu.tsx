import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {MenuButton} from '../../../components/control/menu-button';
import {
	selectAllPassages,
	Story,
	updateStory,
	useStoriesContext
} from '../../../store/stories';
import {usePublishing} from '../../../store/use-publishing';
import {useStoryLaunch} from '../../../store/use-story-launch';
import {storyFilename} from '../../../util/publish';
import {saveHtml} from '../../../util/save-html';
import {useDialogsContext} from '../dialogs';
import {RenameStoryModal} from './rename-story-modal';
import {SetStoryFormatModal} from './set-story-format-modal';

export interface MoreMenuProps {
	story: Story;
}

export const MoreMenu: React.FC<MoreMenuProps> = props => {
	const {story} = props;
	const history = useHistory();
	const {dispatch: dialogsDispatch} = useDialogsContext();
	const {dispatch: storiesDispatch, stories} = useStoriesContext();
	const {proofStory} = useStoryLaunch();
	const {publishStory} = usePublishing();
	const [renameModalOpen, setRenameModalOpen] = React.useState(false);
	const [storyFormatModalOpen, setStoryFormatModalOpen] = React.useState(false);
	const {t} = useTranslation();

	async function handlePublishFile() {
		saveHtml(await publishStory(story.id), storyFilename(story));
	}

	return (
		<>
			<MenuButton
				icon="more-horizontal"
				items={[
					{
						label: t('storyEdit.topBar.findAndReplace'),
						onClick: () =>
							dialogsDispatch({
								type: 'addDialog',
								dialog: {type: 'storySearch'}
							})
					},
					{
						label: t('storyEdit.topBar.selectAllPassages'),
						onClick: () => storiesDispatch(selectAllPassages(story))
					},
					{
						checked: story.snapToGrid,
						label: t('storyEdit.topBar.snapToGrid'),
						onClick: () =>
							storiesDispatch(
								updateStory(stories, story, {
									snapToGrid: !story.snapToGrid
								})
							)
					},
					{separator: true},
					{
						label: t('storyEdit.topBar.publishToFile'),
						onClick: handlePublishFile
					},
					{
						label: t('storyEdit.topBar.storyStats'),
						onClick: () =>
							dialogsDispatch({type: 'addDialog', dialog: {type: 'storyStats'}})
					},
					{
						label: t('storyEdit.topBar.proofStory'),
						onClick: () => proofStory(story.id)
					},
					{separator: true},
					{
						label: t('storyEdit.topBar.renameStory'),
						onClick: () => setRenameModalOpen(true)
					},
					{
						label: t('storyEdit.topBar.setStoryFormat'),
						onClick: () => setStoryFormatModalOpen(true)
					},
					{separator: true},
					{
						label: t('storyEdit.topBar.editJavaScript'),
						onClick: () =>
							dialogsDispatch({
								type: 'addDialog',
								dialog: {type: 'storyJavaScript'}
							})
					},
					{
						label: t('storyEdit.topBar.editStylesheet'),
						onClick: () =>
							dialogsDispatch({
								type: 'addDialog',
								dialog: {type: 'storyStylesheet'}
							})
					}
				]}
				label={t('common.more')}
			/>
			<RenameStoryModal
				onClose={() => setRenameModalOpen(false)}
				open={renameModalOpen}
				story={story}
			/>
			<SetStoryFormatModal
				onClose={() => setStoryFormatModalOpen(false)}
				open={storyFormatModalOpen}
				story={story}
			/>
		</>
	);
};
