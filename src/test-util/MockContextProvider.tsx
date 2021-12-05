import * as React from 'react';
import {fakeLoadedStoryFormat} from '.';
import {DialogsContext, DialogsContextProps} from '../dialogs';
import {PrefsContext, PrefsContextProps} from '../store/prefs';
import {StoriesContext, StoriesContextProps} from '../store/stories';
import {
	StoryFormatsContext,
	StoryFormatsContextProps
} from '../store/story-formats';
import {
	UndoableStoriesContext,
	UndoableStoriesContextProps
} from '../store/undoable-stories';
import {fakePrefs, fakeStory} from './fakes';

export interface MockContextProviderProps {
	dialogs?: Partial<DialogsContextProps>;
	prefs?: Partial<PrefsContextProps>;
	stories?: Partial<StoriesContextProps>;
	storyFormats?: Partial<StoryFormatsContextProps>;
	undoableStories?: Partial<UndoableStoriesContextProps>;
}

export const MockContextProvider: React.FC<MockContextProviderProps> = props => {
	const format = fakeLoadedStoryFormat();
	const story = fakeStory(1);

	story.storyFormat = format.name;
	story.storyFormatVersion = format.version;

	return (
		<PrefsContext.Provider
			value={{dispatch: jest.fn, prefs: fakePrefs(), ...props.prefs}}
		>
			<StoryFormatsContext.Provider
				value={{
					dispatch: jest.fn(),
					formats: [format],
					...props.storyFormats
				}}
			>
				<StoriesContext.Provider
					value={{dispatch: jest.fn(), stories: [story], ...props.stories}}
				>
					<UndoableStoriesContext.Provider
						value={{
							dispatch: jest.fn(),
							stories: [story],
							...props.undoableStories
						}}
					>
						<DialogsContext.Provider
							value={{dialogs: [], dispatch: jest.fn(), ...props.dialogs}}
						>
							{props.children}
						</DialogsContext.Provider>
					</UndoableStoriesContext.Provider>
				</StoriesContext.Provider>
			</StoryFormatsContext.Provider>
		</PrefsContext.Provider>
	);
};
