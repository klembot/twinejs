import {PrefsAction, PrefsState} from './prefs.types';

export const reducer: React.Reducer<PrefsState, PrefsAction> = (
	state,
	action
) => {
	switch (action.type) {
		case 'init':
			return {...state, ...action.state};

		case 'repair':
			// TODO: implement :)
			throw new Error('Not implemented yet');

		case 'update': {
			return {...state, [action.name]: action.value};
		}
	}
};
