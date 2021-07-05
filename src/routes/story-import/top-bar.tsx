import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {
	IconArrowLeft,
	IconBan,
	IconChecks,
	IconFileImport,
	IconFileUpload
} from '@tabler/icons';
import {TopBar} from '../../components/container/top-bar';
import {IconButton} from '../../components/control/icon-button';
import {Story} from '../../store/stories';

export interface StoryImportTopBarProps {
	file?: File;
	idsToImport: string[];
	onClearFile: () => void;
	onDeselectAll: () => void;
	onImportSelected: () => void;
	onSelectAll: () => void;
	stories: Story[];
}

export const StoryImportTopBar: React.FC<StoryImportTopBarProps> = props => {
	const {
		file,
		idsToImport,
		onClearFile,
		onDeselectAll,
		onImportSelected,
		onSelectAll,
		stories
	} = props;
	const history = useHistory();
	const {t} = useTranslation();

	return (
		<TopBar>
			<IconButton
				icon={<IconArrowLeft />}
				label={t('storyList.titleGeneric')}
				onClick={() => history.push('/')}
				variant="primary"
			/>
			<IconButton
				disabled={!file}
				icon={<IconFileUpload />}
				label={t('routes.storyImport.importDifferentFile')}
				onClick={onClearFile}
			/>
			<IconButton
				disabled={stories.length === 0}
				icon={<IconChecks />}
				label={t('routes.storyImport.selectAll')}
				onClick={onSelectAll}
			/>
			<IconButton
				disabled={stories.length === 0}
				icon={<IconBan />}
				label={t('routes.storyImport.deselectAll')}
				onClick={onDeselectAll}
			/>
			<IconButton
				disabled={idsToImport.length === 0}
				icon={<IconFileImport />}
				label={t('routes.storyImport.importSelected')}
				onClick={onImportSelected}
			/>
		</TopBar>
	);
};
