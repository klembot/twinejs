import * as React from 'react';
import {PrefsState, usePrefsContext} from '../store/prefs';

export interface PrefInspectorProps {
	name: keyof PrefsState;
}

export const PrefInspector: React.FC<PrefInspectorProps> = ({name}) => {
	const {prefs} = usePrefsContext();

	return (
		<div hidden data-testid={`pref-inspector-${name}`}>
			{JSON.stringify(prefs[name])}
		</div>
	);
};
