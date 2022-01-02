import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconPackage} from '@tabler/icons';
import {IconButton} from '../../../../components/control/icon-button';
import {useStoriesContext} from '../../../../store/stories';
import {archiveFilename, publishArchive} from '../../../../util/publish';
import {saveHtml} from '../../../../util/save-html';
import {getAppInfo} from '../../../../util/app-info';

export const ArchiveButton: React.FC = () => {
	const {stories} = useStoriesContext();
	const {t} = useTranslation();

	return (
		<IconButton
			icon={<IconPackage />}
			label={t('routes.storyList.toolbar.archive')}
			onClick={() =>
				saveHtml(publishArchive(stories, getAppInfo()), archiveFilename())
			}
		/>
	);
};
