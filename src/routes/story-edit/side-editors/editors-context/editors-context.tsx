import * as React from 'react';
import {reducer, EditorsAction, EditorsState} from './reducer';

export interface EditorsContextProps {
	dispatch: React.Dispatch<EditorsAction>;
	editors: EditorsState;
}

export const EditorsContext = React.createContext<EditorsContextProps>({
	dispatch: () => {},
	editors: []
});

EditorsContext.displayName = 'Editors';

export const useEditorsContext = () => React.useContext(EditorsContext);

export const EditorsContextProvider: React.FC = props => {
	const [editors, dispatch] = React.useReducer(reducer, []);

	return (
		<EditorsContext.Provider value={{dispatch, editors}}>
			{props.children}
		</EditorsContext.Provider>
	);
};
