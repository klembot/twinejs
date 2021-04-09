import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {Card} from '../../../components/container/card';
import {IconButton} from '../../../components/control/icon-button';
import {DropdownButton} from '../../../components/control/dropdown-button';
import {setPref, usePrefsContext} from '../../../store/prefs';

export const SortByButton: React.FC = () => {
	const {t} = useTranslation();
	const {dispatch, prefs} = usePrefsContext();

	return (
		<DropdownButton icon="bar-chart" label={t('storyList.topBar.sort')}>
			<Card>
				<IconButton
					icon={prefs.storyListSort === 'date' ? 'check' : 'empty'}
					label={t('storyList.topBar.sortDate')}
					onClick={() => setPref(dispatch, 'storyListSort', 'date')}
				/>
				<IconButton
					icon={prefs.storyListSort === 'name' ? 'check' : 'empty'}
					label={t('storyList.topBar.sortName')}
					onClick={() => setPref(dispatch, 'storyListSort', 'name')}
				/>
			</Card>
		</DropdownButton>
	);
};
