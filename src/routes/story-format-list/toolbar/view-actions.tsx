import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {CheckboxButton} from '../../../components/control/checkbox-button';
import {setPref, usePrefsContext} from '../../../store/prefs';

export const ViewActions: React.FC = () => {
	const {dispatch, prefs} = usePrefsContext();
	const {t} = useTranslation();

	function setFilter(name: string) {
		dispatch(setPref('storyFormatListFilter', name));
	}

	return (
		<>
			<CheckboxButton
				disabled={prefs.storyFormatListFilter === 'current'}
				label={t('routes.storyFormatList.title.current')}
				onChange={() => setFilter('current')}
				value={prefs.storyFormatListFilter === 'current'}
			/>
			<CheckboxButton
				disabled={prefs.storyFormatListFilter === 'user'}
				label={t('routes.storyFormatList.title.user')}
				onChange={() => setFilter('user')}
				value={prefs.storyFormatListFilter === 'user'}
			/>
			<CheckboxButton
				disabled={prefs.storyFormatListFilter === 'all'}
				label={t('routes.storyFormatList.title.all')}
				onChange={() => setFilter('all')}
				value={prefs.storyFormatListFilter === 'all'}
			/>
		</>
	);
};
