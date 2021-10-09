import {PrefsContext, PrefsContextProps} from '../store/prefs';
import {
	StoryFormatsContext,
	StoryFormatsContextProps
} from '../store/story-formats';
import {
	UndoableStoriesContext,
	UndoableStoriesContextProps
} from '../store/undoable-stories';
import {fakeLoadedStoryFormat, fakePrefs, fakeStory} from './fakes';

export interface MockStateContextProviderProps {
	prefs?: Partial<PrefsContextProps>;
	stories?: Partial<UndoableStoriesContextProps>;
	storyFormats?: Partial<StoryFormatsContextProps>;
}

export const MockStateContextProvider: React.FC<MockStateContextProviderProps> = props => {
	const storyFormat = fakeLoadedStoryFormat();
	const story = fakeStory(1);

	story.storyFormat = storyFormat.name;
	story.storyFormatVersion = storyFormat.version;

	const mockPrefsContext: PrefsContextProps = {
		dispatch: jest.fn(),
		// Set the pref to light to avoid having to deal with mocking
		// window.matchMedia() unless we're ready to do that.
		prefs: fakePrefs({appTheme: 'light'}),
		...props.prefs
	};
	const mockStoryFormatsContext: StoryFormatsContextProps = {
		dispatch: jest.fn(),
		formats: [storyFormat],
		...props.storyFormats
	};
	const mockStoriesContext: UndoableStoriesContextProps = {
		dispatch: jest.fn(),
		stories: [story],
		...props.stories
	};

	return (
		<PrefsContext.Provider value={mockPrefsContext}>
			<StoryFormatsContext.Provider value={mockStoryFormatsContext}>
				<UndoableStoriesContext.Provider value={mockStoriesContext}>
					{props.children}
				</UndoableStoriesContext.Provider>
			</StoryFormatsContext.Provider>
		</PrefsContext.Provider>
	);
};
