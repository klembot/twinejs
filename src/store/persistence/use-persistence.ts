import * as React from 'react';
import {isElectronRenderer} from '../../util/is-electron';
import {PrefsAction, PrefsState} from '../prefs';
import {StoriesAction, StoriesState, Story} from '../stories';
import {
	StoryFormatsAction,
	StoryFormatsState,
	StoryFormat
} from '../story-formats';
import {
	load as electronPrefsLoad,
	saveMiddleware as electronPrefsSaveMiddleware
} from './electron-ipc/prefs';
import {
	load as electronStoriesLoad,
	saveMiddleware as electronStoriesSaveMiddleware
} from './electron-ipc/stories';
import {
	load as electronStoryFormatsLoad,
	saveMiddleware as electronStoryFormatsSaveMiddleware
} from './electron-ipc/story-formats';
import {
	load as localPrefsLoad,
	saveMiddleware as localPrefsSaveMiddleware
} from './local-storage/prefs';
import {
	load as localStoriesLoad,
	saveMiddleware as localStoriesSaveMiddleware
} from './local-storage/stories';
import {
	load as localStoryFormatsLoad,
	saveMiddleware as localStoryFormatsSaveMiddleware
} from './local-storage/story-formats';

interface PersistenceFunctions {
	prefs: {
		load: () => Partial<PrefsState>;
		saveMiddleware: (state: PrefsState, action: PrefsAction) => void;
	};
	stories: {
		load: () => Story[];

		// The stories middleware needs access to story formats in state so that it
		// can try to save stories in published form.

		saveMiddleware: (
			state: StoriesState,
			action: StoriesAction,
			formats: StoryFormatsState
		) => void;
	};
	storyFormats: {
		load: () => StoryFormat[];
		saveMiddleware: (
			state: StoryFormatsState,
			action: StoryFormatsAction
		) => void;
	};
}

const electronPersistence = {
	prefs: {
		load: electronPrefsLoad,
		saveMiddleware: electronPrefsSaveMiddleware
	},
	stories: {
		load: electronStoriesLoad,
		saveMiddleware: electronStoriesSaveMiddleware
	},
	storyFormats: {
		load: electronStoryFormatsLoad,
		saveMiddleware: electronStoryFormatsSaveMiddleware
	}
};

const localStoragePersistence = {
	prefs: {
		load: localPrefsLoad,
		saveMiddleware: localPrefsSaveMiddleware
	},
	stories: {
		load: localStoriesLoad,
		saveMiddleware: localStoriesSaveMiddleware
	},
	storyFormats: {
		load: localStoryFormatsLoad,
		saveMiddleware: localStoryFormatsSaveMiddleware
	}
};

export function usePersistence(): PersistenceFunctions {
	return React.useMemo(
		() =>
			isElectronRenderer()
				? electronPersistence
				: localStoragePersistence,
		[]
	);
}
