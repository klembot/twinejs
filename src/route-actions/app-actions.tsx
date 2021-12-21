import {IconAward, IconBug, IconFileCode, IconSettings} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {ButtonBar} from '../components/container/button-bar';
import {IconButton} from '../components/control/icon-button';
import {AboutTwineDialog, AppPrefsDialog, useDialogsContext} from '../dialogs';

export const AppActions: React.FC = () => {
	const {dispatch} = useDialogsContext();
	const history = useHistory();
	const {t} = useTranslation();

	return (
		<ButtonBar>
			<IconButton
				icon={<IconSettings />}
				label={t('routeActions.app.preferences')}
				onClick={() => dispatch({type: 'addDialog', component: AppPrefsDialog})}
			/>
			<IconButton
				disabled={history.location.pathname === '/story-formats'}
				icon={<IconFileCode />}
				label={t('routeActions.app.storyFormats')}
				onClick={() => history.push('/story-formats')}
			/>
			<IconButton
				icon={<IconAward />}
				label={t('routeActions.app.aboutApp')}
				onClick={() =>
					dispatch({type: 'addDialog', component: AboutTwineDialog})
				}
			/>
			<IconButton
				icon={<IconBug />}
				label={t('routeActions.app.reportBug')}
				onClick={() => window.open('https://twinery.org/2bugs', '_blank')}
			/>
		</ButtonBar>
	);
};
