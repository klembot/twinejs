import {IconDeviceFloppy, IconHelp, IconMoodSmile} from '@tabler/icons';
import {IconTwine} from '../../components/image/icon';
import {isElectronRenderer} from '../../util/is-electron';

export const content = () => [
	{
		html: 'welcome.greeting',
		image: <IconTwine />,
		nextLabel: 'welcome.tellMeMore',
		title: 'welcome.greetingTitle'
	},
	{
		html: 'welcome.help',
		image: <IconHelp />,
		title: 'welcome.helpTitle'
	},
	isElectronRenderer()
		? {
				html: 'welcome.autosave',
				image: <IconDeviceFloppy />,
				title: 'welcome.autosaveTitle'
		  }
		: {
				html: 'welcome.browserStorage',
				image: <IconDeviceFloppy />,
				title: 'welcome.browserStorageTitle'
		  },
	{
		html: 'welcome.done',
		image: <IconMoodSmile />,
		nextLabel: 'welcome.gotoStoryList',
		title: 'welcome.doneTitle'
	}
];
