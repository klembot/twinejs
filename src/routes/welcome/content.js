import isElectron from '@/util/is-electron';
import {t} from '@/util/i18n';
import TwineLogo from '@/../icons/app.svg';

export default () => [
	{
		html: t('welcome.greeting'),
		image: TwineLogo,
		nextLabel: t('welcome.tellMeMore'),
		title: t('welcome.greetingTitle')
	},
	{
		html: t('welcome.help'),
		icon: 'help-circle',
		title: t('welcome.helpTitle')
	},
	isElectron()
		? {
				html: t('welcome.autosave'),
				icon: 'save',
				title: t('welcome.autosaveTitle')
		  }
		: {
				html: t('welcome.browserStorage'),
				icon: 'save',
				title: t('welcome.browserStorageTitle')
		  },
	{
		html: t('welcome.done'),
		icon: 'smile',
		nextLabel: t('welcome.gotoStoryList'),
		title: t('welcome.doneTitle')
	}
];
