export type PrefsAction =
	| {type: 'init'; state: Partial<PrefsState>}
	| {
			type: 'update';
			name: keyof PrefsState;
			value: boolean | number | string | {name: string; version: string};
	  }
	| {type: 'repair'};

export interface PrefsState {
	appTheme: 'dark' | 'light';
	donateShown: boolean;
	firstRunTime: number;
	javascriptEditorFontFamily: string;
	javascriptEditorFontScale: number;
	lastUpdateSeen: string;
	lastUpdateCheckTime: number;
	locale: string;
	passageEditorFontFamily: string;
	passageEditorFontScale: number;
	proofingFormat: {
		name: string;
		version: string;
	};
	storyFormat: {
		name: string;
		version: string;
	};
	storyListSort: 'date' | 'name';
	stylesheetEditorFontFamily: string;
	stylesheetEditorFontScale: number;
	welcomeSeen: boolean;
}

export type PrefsDispatch = React.Dispatch<PrefsAction>;

export interface PrefsContextProps {
	dispatch: PrefsDispatch;
	prefs: PrefsState;
}
