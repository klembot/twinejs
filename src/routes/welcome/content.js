import isElectron from '@/util/is-electron';
import {t} from '@/util/i18n';
import HelpImage from './help.svg';
import SaveImage from './save.svg';
import SmileImage from './smile.svg';
import TwineLogo from '@/../icons/app.svg';

export default () => [
	{
		html: t('welcome.greeting'),
		image: TwineLogo,
		nextLabel: t('welcome.tellMeMore'),
		title: t('welcome.greetingTitle')
	},
	{
		html: t('welcome.versionDiffs'),
		image: HelpImage,
		title: t('welcome.versionDiffsTitle')
	},
	isElectron
		? {
				html: t('welcome.autosave'),
				image: SaveImage,
				title: t('welcome.autosaveTitle')
		  }
		: {
				html: t('welcome.browserStorage'),
				image: SaveImage,
				title: t('welcome.browserStorageTitle')
		  },
	{
		html: t('welcome.done'),
		image: SmileImage,
		nextLabel: t('welcome.gotoStoryList'),
		title: t('welcome.doneTitle')
	}
];
