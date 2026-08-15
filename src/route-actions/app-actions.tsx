import {
	IconAward,
	IconBug,
	IconFileCode,
	IconKeyboard,
	IconSettings
} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {ButtonBar} from '../components/container/button-bar';
import {IconButton} from '../components/control/icon-button';
import {
	AboutTwineDialog,
	AppPrefsDialog,
	KeyboardShortcutsDialog,
	useDialogsContext
} from '../dialogs';
import {useCommand} from '../hotkeys';
import {StoryFormatsDialog} from '../dialogs/story-formats/story-formats';

export const AppActions: React.FC = () => {
	const {dispatch} = useDialogsContext();
	const history = useHistory();
	const {t} = useTranslation();
	const handlePreferences = React.useCallback(
		() => dispatch({type: 'addDialog', component: AppPrefsDialog}),
		[dispatch]
	);

	useCommand({
		id: 'app.preferences',
		label: t('routeActions.app.preferences'),
		run: handlePreferences
	});
	const handleKeyboardShortcuts = React.useCallback(
		() =>
			dispatch({
				type: 'addDialog',
				component: KeyboardShortcutsDialog,
				maximized: true
			}),
		[dispatch]
	);

	useCommand({
		id: 'app.keyboardShortcuts',
		label: t('dialogs.keyboardShortcuts.title'),
		run: handleKeyboardShortcuts
	});

	return (
		<ButtonBar>
			<IconButton
				icon={<IconSettings />}
				label={t('routeActions.app.preferences')}
				onClick={handlePreferences}
			/>
			<IconButton
				disabled={history.location.pathname === '/story-formats'}
				icon={<IconFileCode />}
				label={t('routeActions.app.storyFormats')}
				onClick={() =>
					dispatch({type: 'addDialog', component: StoryFormatsDialog})
				}
			/>
			<IconButton
				icon={<IconKeyboard />}
				label={t('dialogs.keyboardShortcuts.title')}
				onClick={handleKeyboardShortcuts}
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
