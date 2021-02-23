export default {
	appTheme: 'light',
	donateShown: false,
	firstRunTime: new Date().getTime(),
	javascriptEditorFontFamily: 'var(--font-monospaced)',
	javascriptEditorFontScale: 1,
	lastUpdateSeen: '',
	lastUpdateCheckTime: new Date().getTime(),
	locale:
		window.navigator.userLanguage ||
		window.navigator.language ||
		window.navigator.browserLanguage ||
		window.navigator.systemLanguage ||
		'en-us',
	passageEditorFontFamily: 'var(--font-system)',
	passageEditorFontScale: -1,
	proofingFormat: {
		name: 'Paperthin',
		version: '1.0.0'
	},
	storyFormat: {
		name: 'Harlowe',
		version: '3.0.2'
	},
	welcomeSeen: false
};
