import * as React from 'react';
import {useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {TopBar} from '../../../components/container/top-bar';
import {IconButton} from '../../../components/control/icon-button';
import {IconLink} from '../../../components/control/icon-link';
import {MenuButton} from '../../../components/control/menu-button';
import {ArchiveButton} from './archive-button';
import {CreateStoryButton} from './create-story-button';
import {SortByButton} from './sort-by-button';

export const StoryListTopBar: React.FC = () => {
	const history = useHistory();
	const {t} = useTranslation();

	// TODO: implement import route
	// TODO: implement story format list route

	return (
		<TopBar>
			<CreateStoryButton />
			<SortByButton />
			<ArchiveButton />
			<IconButton
				icon="upload"
				label={t('common.import')}
				onClick={() => history.push('/import/stories')}
			/>
			<IconButton
				icon="file-text"
				label={t('storyList.topBar.storyFormats')}
				onClick={() => history.push('/story-formats')}
			/>
			<IconLink
				href="https://twinery.org/2guide"
				icon="help-circle"
				label={t('storyList.topBar.help')}
			/>
			<MenuButton
				icon="more-horizontal"
				items={[
					{
						label: t('storyList.topBar.language'),
						onClick: () => history.push('/locale')
					},
					{
						label: t('storyList.topBar.about'),
						onClick: () => history.push('/about')
					},
					{
						label: t('storyList.topBar.reportBug'),
						onClick: () => window.open('https://twinery.org/2bugs', '_blank')
					}
				]}
				label={t('common.more')}
			/>
		</TopBar>
	);
};
