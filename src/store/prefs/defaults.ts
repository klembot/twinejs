import {PrefsState} from './prefs.types';

export const defaults = (): PrefsState => ({
	appTheme: 'light',
	donateShown: false,
	firstRunTime: new Date().getTime(),
	javascriptEditorFontFamily: 'var(--font-monospaced)',
	javascriptEditorFontScale: 1,
	lastUpdateSeen: '',
	lastUpdateCheckTime: new Date().getTime(),
	locale:
		(window.navigator as any).userLanguage ||
		window.navigator.language ||
		(window.navigator as any).browserLanguage ||
		(window.navigator as any).systemLanguage ||
		'en-us',
	passageEditorFontFamily: 'var(--font-system)',
	passageEditorFontScale: 1,
	proofingFormat: {
		name: 'Paperthin',
		version: '1.0.0'
	},
	storyFormat: {
		name: 'Harlowe',
		version: '3.2.1'
	},
	storyListSort: 'name',
	storyTagColors: {},
	stylesheetEditorFontFamily: 'var(--font-monospaced)',
	stylesheetEditorFontScale: 1,
	welcomeSeen: false
});
