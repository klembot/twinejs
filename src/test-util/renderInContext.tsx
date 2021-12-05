// import {render} from '@testing-library/react';
// import { PrefsContext, PrefsContextProps } from '../store/prefs';
// import {StoriesContext, StoriesContextProps} from '../store/stories';
// import {UndoableStoriesContext, UndoableStoriesContextProps} from '../store/undoable-stories';
// import { fakePrefs, fakeStory } from './fakes';

// export interface RenderContextProps {
// 	prefs?: Partial<PrefsContextProps>;
// 	stories?: Partial<StoriesContextProps>;
// 	undoableStories?: Partial<UndoableStoriesContextProps>;
// }

// export function renderInContext(
// 	node: React.ReactNode,
// 	context?: RenderContextProps
// ) {
// 	const stories = [fakeStory()];

// 	return render(
// 		<PrefsContext.Provider value={{dispatch: jest.fn(), prefs: fakePrefs(), ...context?.prefs}}>
// 		<StoriesContext.Provider value={{dispatch: jest.fn(), stories: stories, ...context?.stories}}>
// 		<UndoableStoriesContext.Provider value={{dispatch: jest.fn(), stories: stories, ...context?.undoableStories}}>
// 			{node}
// 		</UndoableStoriesContext.Provider>
// 		</StoriesContext.Provider>
// 		</PrefsContext.Provider>
// }
