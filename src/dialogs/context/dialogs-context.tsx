import * as React from 'react';
import useThunkReducer, {Thunk} from 'react-hook-thunk-reducer';
import {reducer} from './reducer';
import {Dialogs} from './dialogs';
import {DialogsAction, DialogsState} from '../dialogs.types';

export interface DialogsContextProps {
	dispatch: React.Dispatch<DialogsAction | Thunk<DialogsState, DialogsAction>>;
	dialogs: DialogsState;
}

export const DialogsContext = React.createContext<DialogsContextProps>({
	dispatch: () => {},
	dialogs: []
});

DialogsContext.displayName = 'Dialogs';

export const useDialogsContext = () => React.useContext(DialogsContext);

export const DialogsContextProvider: React.FC = props => {
	const [dialogs, dispatch] = useThunkReducer(reducer, []);

	return (
		<DialogsContext.Provider value={{dispatch, dialogs}}>
			{props.children}
			<Dialogs />
		</DialogsContext.Provider>
	);
};
