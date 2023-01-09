import * as React from 'react';
import {addPassageEditors, useDialogsContext} from '../../dialogs';
import {
	deselectPassage,
	movePassages,
	Passage,
	selectPassage,
	selectPassagesInRect,
	Story
} from '../../store/stories';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import {Point, Rect} from '../../util/geometry';

export function usePassageChangeHandlers(story: Story) {
	const selectedPassages = React.useMemo(
		() => story.passages.filter(passage => passage.selected),
		[story.passages]
	);
	const {dispatch: undoableStoriesDispatch} = useUndoableStoriesContext();
	const {dispatch: dialogsDispatch} = useDialogsContext();

	const handleDeselectPassage = React.useCallback(
		(passage: Passage) =>
			undoableStoriesDispatch(deselectPassage(story, passage)),
		[story, undoableStoriesDispatch]
	);

	const handleDragPassages = React.useCallback(
		(change: Point) => {
			// Ignore tiny drags--they're probably caused by the user moving their
			// mouse slightly during double-clicking.

			if (Math.abs(change.left) < 1 && Math.abs(change.top) < 1) {
				return;
			}

			undoableStoriesDispatch(
				movePassages(
					story,
					story.passages.reduce<string[]>(
						(result, current) =>
							current.selected ? [...result, current.id] : result,
						[]
					),
					change.left / story.zoom,
					change.top / story.zoom
				),
				selectedPassages.length > 1
					? 'undoChange.movePassages'
					: 'undoChange.movePassages'
			);
		},
		[selectedPassages.length, story, undoableStoriesDispatch]
	);

	const handleEditPassage = React.useCallback(
		(passage: Passage) =>
			dialogsDispatch(addPassageEditors(story.id, [passage.id])),
		[dialogsDispatch, story.id]
	);

	const handleSelectPassage = React.useCallback(
		(passage: Passage, exclusive: boolean) =>
			undoableStoriesDispatch(selectPassage(story, passage, exclusive)),
		[story, undoableStoriesDispatch]
	);

	const handleSelectRect = React.useCallback(
		(rect: Rect, additive: boolean) => {
			// The rect we receive is in screen coordinates--we need to convert to
			// logical ones.
			const logicalRect: Rect = {
				height: rect.height / story.zoom,
				left: rect.left / story.zoom,
				top: rect.top / story.zoom,
				width: rect.width / story.zoom
			};

			// This should not be undoable.
			undoableStoriesDispatch(
				selectPassagesInRect(
					story,
					logicalRect,
					additive ? selectedPassages.map(passage => passage.id) : []
				)
			);
		},
		[selectedPassages, story, undoableStoriesDispatch]
	);

	return {
		handleDeselectPassage,
		handleDragPassages,
		handleEditPassage,
		handleSelectPassage,
		handleSelectRect
	};
}
