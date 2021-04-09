import * as React from 'react';
import {useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {TopBar} from '../../../components/container/top-bar';
import {Card} from '../../../components/container/card';
import {DropdownButton} from '../../../components/control/dropdown-button';
import {IconButton} from '../../../components/control/icon-button';
import {IconLink} from '../../../components/control/icon-link';
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
			<DropdownButton icon="more-horizontal" label={t('common.more')}>
				<Card>
					<IconButton
						icon="globe"
						label={t('storyList.topBar.language')}
						onClick={() => history.push('/locale')}
					/>
					<IconButton
						icon="info"
						label={t('storyList.topBar.about')}
						onClick={() => history.push('/about')}
					/>
					<IconLink
						href="https://twinery.org/2bugs"
						icon="frown"
						label={t('storyList.topBar.reportBug')}
					/>
				</Card>
			</DropdownButton>
		</TopBar>
	);
};
