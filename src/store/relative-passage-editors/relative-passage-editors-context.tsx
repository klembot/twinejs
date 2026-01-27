import * as React from 'react';
import {
	RelativePassageEditorsContextProps,
	RelativePassageEditorsState
} from './relative-passage-editors.types';
import {reducer} from './reducer';

const initialState: RelativePassageEditorsState = {
	editors: [],
	activeEditorId: null
};

export const RelativePassageEditorsContext =
	React.createContext<RelativePassageEditorsContextProps>({
		dispatch: () => {},
		state: initialState
	});

RelativePassageEditorsContext.displayName = 'RelativePassageEditors';

export const useRelativePassageEditorsContext = () =>
	React.useContext(RelativePassageEditorsContext);

export const RelativePassageEditorsContextProvider: React.FC = props => {
	const [state, dispatch] = React.useReducer(reducer, initialState);

	return (
		<RelativePassageEditorsContext.Provider
			value={{
				dispatch,
				state
			}}
		>
			{props.children}
		</RelativePassageEditorsContext.Provider>
	);
};
