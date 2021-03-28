import helpCircle from 'feather-icons/dist/icons/help-circle.svg';
import save from 'feather-icons/dist/icons/save.svg';
import smile from 'feather-icons/dist/icons/smile.svg';
import {isElectronRenderer} from '../../util/is-electron';
import twineLogo from './logo.svg';

export const content = () => [
	{
		html: 'welcome.greeting',
		image: twineLogo,
		nextLabel: 'welcome.tellMeMore',
		title: 'welcome.greetingTitle'
	},
	{
		html: 'welcome.help',
		image: helpCircle,
		title: 'welcome.helpTitle'
	},
	isElectronRenderer()
		? {
				html: 'welcome.autosave',
				image: save,
				title: 'welcome.autosaveTitle'
		  }
		: {
				html: 'welcome.browserStorage',
				image: save,
				title: 'welcome.browserStorageTitle'
		  },
	{
		html: 'welcome.done',
		image: smile,
		nextLabel: 'welcome.gotoStoryList',
		title: 'welcome.doneTitle'
	}
];
