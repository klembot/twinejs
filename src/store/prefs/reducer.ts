import {PrefsAction, PrefsState} from './prefs.types';
import {defaults} from './defaults';

export const reducer: React.Reducer<PrefsState, PrefsAction> = (
	state,
	action
) => {
	switch (action.type) {
		case 'init':
			return {...state, ...action.state};

		case 'repair':
			let changes: Partial<PrefsState> = Object.entries(defaults()).reduce(
				(result, [key, value]) => {
					const prefKey = key as keyof PrefsState;

					if (
						(typeof value === 'number' && !Number.isFinite(state[prefKey])) ||
						typeof value !== typeof state[prefKey]
					) {
						console.info(
							`Repairing preference "${key}" by setting it to ${value}, ` +
								`was ${state[prefKey]} (bad type)`
						);
						return {...result, [prefKey]: value};
					}

					return result;
				},
				{}
			);
			return {...state, ...changes};

		case 'update': {
			return {...state, [action.name]: action.value};
		}
	}
};
