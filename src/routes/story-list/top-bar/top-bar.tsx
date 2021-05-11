import * as React from 'react';
import {useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {IconDots, IconFileCode, IconFileImport, IconHelp} from '@tabler/icons';
import {TopBar} from '../../../components/container/top-bar';
import {IconButton} from '../../../components/control/icon-button';
import {IconLink} from '../../../components/control/icon-link';
import {MenuButton} from '../../../components/control/menu-button';
import {storyTags, Story} from '../../../store/stories';
import {ArchiveButton} from './archive-button';
import {CreateStoryButton} from './create-story-button';
import {TagFilterButton} from './tag-filter-button';
import {SortByButton} from './sort-by-button';

export interface StoryListTopBarProps {
	stories: Story[];
}

export const StoryListTopBar: React.FC<StoryListTopBarProps> = props => {
	const history = useHistory();
	const {t} = useTranslation();

	// TODO: implement import route
	// TODO: implement story format list route

	return (
		<TopBar>
			<CreateStoryButton />
			<SortByButton />
			<TagFilterButton tags={storyTags(props.stories)} />
			<ArchiveButton />
			<IconButton
				icon={<IconFileImport />}
				label={t('common.import')}
				onClick={() => history.push('/import/stories')}
			/>
			<IconButton
				icon={<IconFileCode />}
				label={t('storyList.topBar.storyFormats')}
				onClick={() => history.push('/story-formats')}
			/>
			<IconLink
				href="https://twinery.org/2guide"
				icon={<IconHelp />}
				label={t('storyList.topBar.help')}
			/>
			<MenuButton
				icon={<IconDots />}
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
