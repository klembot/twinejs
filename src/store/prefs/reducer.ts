import {PrefsAction, PrefsState} from './prefs.types';
import {defaults} from './defaults';
import {formatWithNameAndVersion, newestFormatNamed} from '../story-formats';

export const reducer: React.Reducer<PrefsState, PrefsAction> = (
	state,
	action
) => {
	switch (action.type) {
		case 'init':
			return {...state, ...action.state};

		case 'repair':
			const defs = defaults();

			// Type check values.

			let changes: Partial<PrefsState> = Object.entries(defs).reduce(
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

			// If the proofing or story format don't match an existing format, repair
			// them to the most recent version with the same name. If none exist with
			// that name, repair to the default.

			const {proofingFormat, storyFormat} = state;
			const {allFormats} = action;

			try {
				formatWithNameAndVersion(
					allFormats,
					proofingFormat.name,
					proofingFormat.version
				);
			} catch {
				const format = newestFormatNamed(allFormats, proofingFormat.name);

				if (format) {
					console.info(
						`Repairing proofing format preference (version doesn't exist) by setting to ${format.name} ${format.version}, was ${proofingFormat.name} ${proofingFormat.version}`
					);
					changes.proofingFormat = {name: format.name, version: format.version};
				} else {
					console.info(
						`Repairing proofing format preference (format doesn't exist at all) by setting to default ${defs.proofingFormat.name} ${defs.proofingFormat.version}, was ${proofingFormat.name} ${proofingFormat.version}`
					);
					changes.proofingFormat = {
						name: defs.proofingFormat.name,
						version: defs.proofingFormat.version
					};
				}
			}

			try {
				formatWithNameAndVersion(
					allFormats,
					storyFormat.name,
					storyFormat.version
				);
			} catch {
				const format = newestFormatNamed(allFormats, storyFormat.name);

				if (format) {
					console.info(
						`Repairing story format preference (version doesn't exist) by setting to ${format.name} ${format.version}, was ${storyFormat.name} ${storyFormat.version}`
					);
					changes.storyFormat = {name: format.name, version: format.version};
				} else {
					console.info(
						`Repairing story format preference (format doesn't exist at all) by setting to default ${defs.storyFormat.name} ${defs.storyFormat.version}, was ${storyFormat.name} ${proofingFormat.version}`
					);
					changes.storyFormat = {
						name: defs.storyFormat.name,
						version: defs.storyFormat.version
					};
				}
			}

			return {...state, ...changes};

		case 'update': {
			return {...state, [action.name]: action.value};
		}
	}
};
