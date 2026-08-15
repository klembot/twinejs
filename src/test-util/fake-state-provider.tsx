import * as React from 'react';
import useThunkReducer from 'react-hook-thunk-reducer';
import {fakeLoadedStoryFormat} from '.';
import {DialogsContextProvider} from '../dialogs';
import {HotkeysProvider} from '../hotkeys';
import {PrefsContext, PrefsState} from '../store/prefs';
import {reducer as prefsReducer} from '../store/prefs/reducer';
import {StoriesContext, StoriesState} from '../store/stories';
import {reducer as storiesReducer} from '../store/stories/reducer';
import {StoryFormatsContext, StoryFormatsState} from '../store/story-formats';
import {reducer as storyFormatsReducer} from '../store/story-formats/reducer';
import {UndoableStoriesContextProvider} from '../store/undoable-stories';
import {fakePrefs, fakeStory} from './fakes';

export interface FakeStateProviderProps {
	/**
	 * Wraps children in a focused element with this hotkey scope, so that
	 * commands registered in it can be triggered. This mirrors what the app
	 * does--<MainContent> focuses itself on mount.
	 */
	hotkeyScope?: string;
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
						<HotkeysProvider>
							<DialogsContextProvider>
								{props.hotkeyScope ? (
									<HotkeyScope scope={props.hotkeyScope}>
										{props.children}
									</HotkeyScope>
								) : (
									props.children
								)}
							</DialogsContextProvider>
						</HotkeysProvider>
					</UndoableStoriesContextProvider>
				</StoriesContext.Provider>
			</StoryFormatsContext.Provider>
		</PrefsContext.Provider>
	);
};

const HotkeyScope: React.FC<{scope: string}> = props => {
	const ref = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => ref.current?.focus(), []);

	return (
		<div data-hotkey-scope={props.scope} ref={ref} tabIndex={-1}>
			{props.children}
		</div>
	);
};
