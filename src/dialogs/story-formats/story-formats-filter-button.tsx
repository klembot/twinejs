import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {setPref, usePrefsContext} from '../../store/prefs';
import {MenuButton} from '../../components/control/menu-button';
import {IconFilter} from '@tabler/icons';

export const StoryFormatsFilterButton: React.FC = () => {
	const {dispatch, prefs} = usePrefsContext();
	const {t} = useTranslation();

	function setFilter(name: string) {
		dispatch(setPref('storyFormatListFilter', name));
	}

	return (
		<MenuButton
			items={[
				{
					checked: prefs.storyFormatListFilter === 'current',
					checkable: true,
					label: t('dialogs.storyFormats.filterButton.current'),
					onClick: () => setFilter('current')
				},
				{
					checked: prefs.storyFormatListFilter === 'user',
					checkable: true,
					label: t('dialogs.storyFormats.filterButton.user'),
					onClick: () => setFilter('user')
				},
				{
					checked: prefs.storyFormatListFilter === 'all',
					checkable: true,
					label: t('dialogs.storyFormats.filterButton.all'),
					onClick: () => setFilter('all')
				}
			]}
			icon={<IconFilter />}
			label={t(
				`dialogs.storyFormats.filterButton.${prefs.storyFormatListFilter}`
			)}
		></MenuButton>
	);
};
