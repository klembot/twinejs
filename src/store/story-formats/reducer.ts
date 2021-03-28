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
			throw new Error('Not implemented yet');

		case 'create':
			return [...state, action.props];

		case 'delete':
			return state.filter(f => f.id !== action.id);

		case 'update':
			return state.map(format => {
				if (format.id !== action.id) {
					return format;
				}

				return {...format, ...action.props} as StoryFormat;
			});
	}

	return state;
};
