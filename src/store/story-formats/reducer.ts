import uuid from 'tiny-uuid';
import {builtins} from './defaults';
import {
	StoryFormat,
	StoryFormatsAction,
	StoryFormatsState
} from './story-formats.types';

export const reducer: React.Reducer<StoryFormatsState, StoryFormatsAction> = (
	state,
	action
) => {
	switch (action.type) {
		case 'init':
			return [...action.state];

		case 'repair':
			const builtinFormats = builtins();

			// Filter out any outdated builtins.

			const result = state.filter(format => {
				const keep =
					format.userAdded ||
					builtinFormats.some(
						f => f.name === format.name && f.version === format.version
					);

				if (!keep) {
					console.info(
						`Repairing story formats by removing ${format.name} ${format.version} ` +
							`(outdated version of built-in format)`
					);
				}

				return keep;
			});

			// Add any builtins not present.

			builtinFormats.forEach(builtinFormat => {
				if (
					!result.some(
						f =>
							f.name === builtinFormat.name &&
							f.version === builtinFormat.version
					)
				) {
					console.info(
						`Repairing story formats by adding built-in ${builtinFormat.name} ${builtinFormat.version}`
					);
					result.push({
						...builtinFormat,
						id: uuid(),
						loadState: 'unloaded',
						selected: false,
						userAdded: false
					});
				}
			});
			return result;

		case 'create':
			if (
				state.some(
					format =>
						format.name === action.props.name &&
						format.version === action.props.version
				)
			) {
				return state;
			}

			return [...state, {...action.props, id: uuid(), loadState: 'unloaded'}];

		case 'delete':
			return state.filter(f => f.id !== action.id);

		case 'update':
			if (
				state.some(
					format =>
						format.id !== action.id &&
						format.name === action.props.name &&
						format.version === action.props.version
				)
			) {
				return state;
			}

			return state.map(format => {
				if (format.id !== action.id) {
					return format;
				}

				return {...format, ...action.props} as StoryFormat;
			});
	}

	return state;
};
