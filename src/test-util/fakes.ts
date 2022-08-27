import {date, internet, lorem, name, random, system} from 'faker';
import {AppInfo} from '../util/app-info';
import {PrefsState} from '../store/prefs';
import {Passage, Story} from '../store/stories';
import {StoryFormat, StoryFormatProperties} from '../store/story-formats';
import {StoryChange} from '../store/undoable-stories';

export function fakeAppInfo(props?: Partial<AppInfo>): AppInfo {
	return {
		name: lorem.words(1),
		version: system.semver(),
		...props
	};
}

export function fakePassage(props?: Partial<Passage>): Passage {
	return {
		highlighted: false,
		id: random.uuid(),
		story: '-1',
		top: Math.random() * 10000,
		left: Math.random() * 10000,
		width: 100,
		height: 100,
		tags: [],
		name: lorem.words(Math.ceil(Math.random() * 10)), // At least 1
		selected: random.boolean(),
		text: lorem.words(Math.round(Math.random() * 500)), // Might be 0
		...props
	};
}

export function fakeFailedStoryFormat(
	props?: Partial<Omit<StoryFormat, 'loadState' | 'properties'>>
): StoryFormat {
	return {
		id: random.uuid(),
		name: lorem.words(2),
		selected: random.boolean(),
		url: '',
		userAdded: false,
		version: system.semver(),
		...props,
		loadError: new Error(lorem.sentence()),
		loadState: 'error'
	};
}

export function fakeLoadedStoryFormat(
	props?: Partial<Omit<StoryFormat, 'loadError' | 'loadState' | 'properties'>>,
	loadProps?: Partial<StoryFormatProperties>
): StoryFormat {
	const formatName = lorem.words(2);
	const formatUrl = internet.url() + '/format.js';
	const formatVersion = system.semver();

	return {
		id: random.uuid(),
		properties: {
			author: `${name.firstName()} ${name.lastName()}`,
			description: lorem.paragraph(),
			image:
				'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDcyIDcyIiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItaW1hZ2UiPjxyZWN0IHg9IjkiIHk9IjkiIHdpZHRoPSI1NCIgaGVpZ2h0PSI1NCIgcng9IjYiIHJ5PSI2Ij48L3JlY3Q+PGNpcmNsZSBjeD0iMjUuNSIgY3k9IjI1LjUiIHI9IjQuNSI+PC9jaXJjbGU+PHBvbHlsaW5lIHBvaW50cz0iNjMgNDUgNDggMzAgMTUgNjMiPjwvcG9seWxpbmU+PC9zdmc+',
			license: lorem.words(5),
			name: formatName,
			proofing: false,
			source: '{{STORY_NAME}} {{STORY_DATA}}',
			url: formatUrl,
			version: formatVersion,
			...loadProps
		},
		name: formatName,
		selected: random.boolean(),
		url: formatUrl,
		userAdded: false,
		version: formatVersion,
		...props,
		loadState: 'loaded'
	};
}

export function fakePendingStoryFormat(
	props?: Partial<Omit<StoryFormat, 'loadError' | 'loadState'>>
): StoryFormat {
	return {
		id: random.uuid(),
		loadState: 'loading',
		name: lorem.words(2),
		selected: random.boolean(),
		url: internet.url(),
		userAdded: false,
		version: system.semver(),
		...props
	};
}

export function fakeUnloadedStoryFormat(
	props?: Partial<Omit<StoryFormat, 'loadError' | 'loadState'>>
): StoryFormat {
	return {
		id: random.uuid(),
		loadState: 'unloaded',
		name: lorem.words(2),
		selected: random.boolean(),
		url: internet.url(),
		userAdded: false,
		version: system.semver(),
		...props
	};
}

export function fakePrefs(overrides?: Partial<PrefsState>): PrefsState {
	// Ensure tag uniqueness.

	const tag = lorem.word();
	const tags = [`${tag}-1`, `${tag}-2`, `${tag}-3`];

	return {
		appTheme: random.arrayElement(['light', 'dark', 'system']),
		codeEditorFontFamily: lorem.words(2),
		codeEditorFontScale: 0.8 + random.number(0.5),
		dialogWidth: random.number(600),
		disabledStoryFormatEditorExtensions: [
			{name: lorem.words(2), version: system.semver()}
		],
		donateShown: random.boolean(),
		editorCursorBlinks: random.boolean(),
		firstRunTime: new Date().getTime(),
		lastUpdateSeen: '',
		lastUpdateCheckTime: new Date().getTime(),
		locale: random.locale(),
		passageEditorFontFamily: lorem.words(2),
		passageEditorFontScale: 0.8 + random.number(0.5),
		proofingFormat: {
			name: lorem.words(2),
			version: system.semver()
		},
		storyFormat: {
			name: lorem.words(2),
			version: system.semver()
		},
		storyFormatListFilter: 'current',
		storyListSort: random.arrayElement(['date', 'name']),
		storyListTagFilter: [],
		storyTagColors: {[tags[0]]: 'red', [tags[1]]: 'green', [tags[2]]: 'blue'},
		welcomeSeen: random.boolean(),
		...overrides
	};
}

export function fakeStory(passageCount: number = 1): Story {
	// Ensure tag uniqueness.

	const tag = lorem.word();
	const tags = [`${tag}-1`, `${tag}-2`, `${tag}-3`];

	const result: Story = {
		id: random.uuid(),
		lastUpdate: date.past(),
		ifid: random.uuid().toUpperCase(),
		name: lorem.words(Math.ceil(Math.random() * 10)), // At least 1
		passages: [],
		selected: random.boolean(),
		script: lorem.words(Math.round(Math.random() * 100)), // Might be 0
		snapToGrid: false,
		startPassage: '-1',
		storyFormat: lorem.words(Math.ceil(Math.random() * 3)), // At least 1
		storyFormatVersion: system.semver(),
		stylesheet: lorem.words(Math.round(Math.random() * 10)), // Might be 0
		tags: [],
		tagColors: {
			[tags[0]]: 'red',
			[tags[1]]: 'green',
			[tags[2]]: 'blue'
		},
		zoom: Math.random()
	};

	for (let i = 0; i < passageCount; i++) {
		result.passages.push(fakePassage({story: result.id}));
	}

	if (result.passages[0]) {
		result.startPassage = result.passages[0].id;
	}

	return result;
}

export function fakeStoryFormatProperties() {
	const result = fakeLoadedStoryFormat();

	if (result.loadState !== 'loaded') {
		throw new Error('Loaded story format has incorrect loadState');
	}

	return result.properties;
}

export function fakeUndoableStoryChange(): StoryChange {
	// Undo/redo are thunks that do nothing.

	return {
		description: lorem.words(2),
		redo: () => () => {},
		undo: () => () => {}
	};
}
