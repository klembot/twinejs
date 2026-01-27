import {RelativePassageEditorsAction} from './relative-passage-editors.types';

export function addRelativeEditor(
	passageId: string,
	storyId: string
): RelativePassageEditorsAction {
	return {type: 'add', passageId, storyId};
}

export function removeRelativeEditor(
	passageId: string
): RelativePassageEditorsAction {
	return {type: 'remove', passageId};
}

export function setActiveEditor(
	passageId: string | null
): RelativePassageEditorsAction {
	return {type: 'setActive', passageId};
}

export function closeAllRelativeEditors(): RelativePassageEditorsAction {
	return {type: 'closeAll'};
}
