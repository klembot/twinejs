import uuid from 'tiny-uuid';
import * as React from 'react';
import {usePersistence} from '../persistence/use-persistence';
import {builtins} from './defaults';
import {
	StoryFormat,
	StoryFormatsAction,
	StoryFormatsContextProps,
	StoryFormatsState
} from './story-formats.types';
import {reducer} from './reducer';

const defaultBuiltins: StoryFormat[] = builtins().map(f => ({
	...f,
	id: uuid(),
	loadState: 'unloaded',
	userAdded: false
}));

export const StoryFormatsContext = React.createContext<StoryFormatsContextProps>(
	{
		dispatch: () => {},
		formats: []
	}
);

StoryFormatsContext.displayName = 'StoryFormats';

export const useStoryFormatsContext = () =>
	React.useContext(StoryFormatsContext);

export const StoryFormatsContextProvider: React.FC = props => {
	const {storyFormats} = usePersistence();
	const persistedReducer: React.Reducer<
		StoryFormatsState,
		StoryFormatsAction
	> = React.useMemo(
		() => (state, action) => {
			const newState = reducer(state, action);

			storyFormats.saveMiddleware(newState, action);
			return newState;
		},
		[storyFormats]
	);

	const [state, dispatch] = React.useReducer(
		persistedReducer,
		defaultBuiltins
	);

	return (
		<StoryFormatsContext.Provider
			value={{
				dispatch,
				formats: state
			}}
		>
			{props.children}
		</StoryFormatsContext.Provider>
	);
};
