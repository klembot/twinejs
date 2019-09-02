/*
Preference-related actions.
*/

export function setPref({dispatch}, name, value) {
	dispatch('UPDATE_PREF', name, value);
}
