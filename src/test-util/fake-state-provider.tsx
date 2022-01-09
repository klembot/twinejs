import * as React from 'react';
import useThunkReducer from 'react-hook-thunk-reducer';
import {fakeLoadedStoryFormat} from '.';
import {DialogsContextProvider} from '../dialogs';
import {PrefsContext, PrefsState} from '../store/prefs';
import {reducer as prefsReducer} from '../store/prefs/reducer';
import {StoriesContext, StoriesState} from '../store/stories';
import {reducer as storiesReducer} from '../store/stories/reducer';
import {StoryFormatsContext, StoryFormatsState} from '../store/story-formats';
import {reducer as storyFormatsReducer} from '../store/story-formats/reducer';
import {UndoableStoriesContextProvider} from '../store/undoable-stories';
import {fakePrefs, fakeStory} from './fakes';

export interface FakeStateProviderProps {
	prefs?: Partial<PrefsState>;
	stories?: StoriesState;
	storyFormats?: StoryFormatsState;
}

export const FakeStateProvider: React.FC<FakeStateProviderProps> = props => {
	const format = fakeLoadedStoryFormat();
	const story = fakeStory();

	story.storyFormat = format.name;
	story.storyFormatVersion = format.version;

	const [prefsState, prefsDispatch] = React.useReducer(prefsReducer, {
		...fakePrefs(),
		...props.prefs
	});
	const [storiesState, storiesDispatch] = useThunkReducer(
		storiesReducer,
		props.stories ?? [story]
	);
	const [storyFormatsState, storyFormatsDispatch] = useThunkReducer(
		storyFormatsReducer,
		props.storyFormats ?? [format]
	);

	return (
		<PrefsContext.Provider value={{dispatch: prefsDispatch, prefs: prefsState}}>
			<StoryFormatsContext.Provider
				value={{dispatch: storyFormatsDispatch, formats: storyFormatsState}}
			>
				<StoriesContext.Provider
					value={{dispatch: storiesDispatch, stories: storiesState}}
				>
					<UndoableStoriesContextProvider>
						<DialogsContextProvider>{props.children}</DialogsContextProvider>
					</UndoableStoriesContextProvider>
				</StoriesContext.Provider>
			</StoryFormatsContext.Provider>
		</PrefsContext.Provider>
	);
};
