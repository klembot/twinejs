import * as React from 'react';
import {useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {IconArrowLeft} from '@tabler/icons';
import {MainContent} from '../../components/container/main-content';
import {TopBar} from '../../components/container/top-bar';
import {FlagButton} from '../../components/control/flag-button';
import {IconButton} from '../../components/control/icon-button';
import {setPref, usePrefsContext} from '../../store/prefs';
import {flags, locales} from '../../util/locales';

export const LocaleSelectRoute: React.FC = () => {
	const {dispatch} = usePrefsContext();
	const history = useHistory();
	const {t} = useTranslation();

	function handleClick(code: string) {
		dispatch(setPref('locale', code));
		history.push('/');
	}

	return (
		<div className="locale-select-route">
			<TopBar>
				<IconButton
					icon={<IconArrowLeft />}
					onClick={() => history.push('/')}
					label={t('storyList.titleGeneric')}
					variant="primary"
				/>
			</TopBar>
			<MainContent>
				<h1>{t('common.language')}</h1>
				<p>{t('localeSelect.explanation')}</p>
				{locales.map(({code, name}) => (
					<FlagButton
						countryCode={code in flags ? (flags as any)[code] : code}
						key={code}
						label={name}
						onClick={() => handleClick(code)}
					/>
				))}
			</MainContent>
		</div>
	);
};
