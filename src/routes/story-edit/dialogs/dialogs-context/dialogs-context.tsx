import * as React from 'react';
import {reducer, DialogsAction, DialogsState} from './reducer';

export interface DialogsContextProps {
	dispatch: React.Dispatch<DialogsAction>;
	dialogs: DialogsState;
}

export const DialogsContext = React.createContext<DialogsContextProps>({
	dispatch: () => {},
	dialogs: []
});

DialogsContext.displayName = 'Editors';

export const useDialogsContext = () => React.useContext(DialogsContext);

export const DialogsContextProvider: React.FC = props => {
	const [dialogs, dispatch] = React.useReducer(reducer, []);

	return (
		<DialogsContext.Provider value={{dispatch, dialogs}}>
			{props.children}
		</DialogsContext.Provider>
	);
};
