import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconPackage} from '@tabler/icons';
import {IconButton} from '../../../../components/control/icon-button';
import {useCommand} from '../../../../hotkeys';
import {useStoriesContext} from '../../../../store/stories';
import {archiveFilename, publishArchive} from '../../../../util/publish';
import {saveHtml} from '../../../../util/save-file';
import {getAppInfo} from '../../../../util/app-info';

export const ArchiveButton: React.FC = () => {
	const {stories} = useStoriesContext();
	const {t} = useTranslation();
	const handleClick = React.useCallback(
		() => saveHtml(publishArchive(stories, getAppInfo()), archiveFilename()),
		[stories]
	);

	useCommand({
		id: 'library.archive',
		label: t('hotkeys.commands.library.archive'),
		run: handleClick,
		scope: 'story-list'
	});

	return (
		<IconButton
			icon={<IconPackage />}
			label={t('routes.storyList.toolbar.archive')}
			onClick={handleClick}
		/>
	);
};
