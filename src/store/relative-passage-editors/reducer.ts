import {
	RelativePassageEditorsAction,
	RelativePassageEditorsState
} from './relative-passage-editors.types';

export const reducer: React.Reducer<
	RelativePassageEditorsState,
	RelativePassageEditorsAction
> = (state, action) => {
	switch (action.type) {
		case 'add': {
			// Don't add duplicate editors
			if (state.editors.some(e => e.passageId === action.passageId)) {
				return state;
			}

			return {
				...state,
				editors: [...state.editors, {passageId: action.passageId, storyId: action.storyId}],
				activeEditorId: action.passageId
			};
		}

		case 'remove': {
			const remaining = state.editors.filter(e => e.passageId !== action.passageId);
			let activeEditorId = state.activeEditorId;

			// If the removed editor was active, clear active
			if (state.activeEditorId === action.passageId) {
				activeEditorId = remaining.length > 0 ? remaining[remaining.length - 1].passageId : null;
			}

			return {
				...state,
				editors: remaining,
				activeEditorId
			};
		}

		case 'setActive': {
			return {
				...state,
				activeEditorId: action.passageId
			};
		}

		case 'closeAll': {
			return {
				...state,
				editors: [],
				activeEditorId: null
			};
		}

		default:
			return state;
	}
};
