/*
Helps catch weird data problems-- if a passage size or position becomes
corrupted, we at least restore them to a value that will allow display.
*/

import {passageDefaults} from './defaults';

export function cleanupPassage(props) {
	const result = {...props};

	['height', 'left', 'top', 'width'].forEach(p => {
		if (typeof result[p] !== 'number' || result[p] < 0 || isNaN(result[p])) {
			result[p] = passageDefaults[p];
		}
	});

	return result;
}
