import * as React from 'react';
import {usePersistence} from '../persistence/use-persistence';
import {useStoreErrorReporter} from '../use-store-error-reporter';
import {defaults} from './defaults';
import {PrefsAction, PrefsContextProps, PrefsState} from './prefs.types';
import {reducer} from './reducer';

export const PrefsContext = React.createContext<PrefsContextProps>({
	dispatch: () => {},
	prefs: defaults()
});

PrefsContext.displayName = 'Prefs';

export const usePrefsContext = () => React.useContext(PrefsContext);

export const PrefsContextProvider: React.FC = props => {
	const {prefs} = usePersistence();
	const {reportError} = useStoreErrorReporter();
	const persistedReducer: React.Reducer<
		PrefsState,
		PrefsAction
	> = React.useCallback(
		(state, action) => {
			const newState = reducer(state, action);

			try {
				prefs.saveMiddleware(newState, action);
			} catch (error) {
				reportError(error, 'store.errors.cantPersistPrefs');
			}

			return newState;
		},
		[prefs, reportError]
	);

	const [state, dispatch] = React.useReducer(persistedReducer, defaults());

	return (
		<PrefsContext.Provider
			value={{
				dispatch,
				prefs: state
			}}
		>
			{props.children}
		</PrefsContext.Provider>
	);
};
