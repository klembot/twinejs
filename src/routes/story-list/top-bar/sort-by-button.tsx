import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconArrowsSort} from '@tabler/icons';
import {MenuButton} from '../../../components/control/menu-button';
import {setPref, usePrefsContext} from '../../../store/prefs';

export const SortByButton: React.FC = () => {
	const {t} = useTranslation();
	const {dispatch, prefs} = usePrefsContext();

	return (
		<MenuButton
			icon={<IconArrowsSort />}
			items={[
				{
					checked: prefs.storyListSort === 'date',
					label: t('storyList.topBar.sortDate'),
					onClick: () => dispatch(setPref('storyListSort', 'date'))
				},
				{
					checked: prefs.storyListSort === 'name',
					label: t('storyList.topBar.sortName'),
					onClick: () => dispatch(setPref('storyListSort', 'name'))
				}
			]}
			label={t('storyList.topBar.sort')}
		/>
	);
};
