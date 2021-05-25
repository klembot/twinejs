import * as React from 'react';
import {useParams} from 'react-router-dom';
import {
	useDialogsContext,
	DialogsContextProvider,
	PassageEditDialog
} from '../../dialogs';
import {Point, Rect} from '../../util/geometry';
import {MainContent} from '../../components/container/main-content';
import {MarqueeSelection} from '../../components/marquee-selection';
import {
	deletePassages,
	deselectPassage,
	Passage,
	movePassages,
	selectPassage,
	selectPassagesInRect,
	storyWithId
} from '../../store/stories';
import {PassageMap} from '../../components/passage/passage-map/passage-map';
import {PassageToolbar} from '../../components/passage/passage-toolbar';
import {StoryEditTopBar} from './top-bar';
import {useStoryLaunch} from '../../store/use-story-launch';
import {
	UndoableStoriesContextProvider,
	useUndoableStoriesContext
} from '../../store/undoable-stories';
import './story-edit-route.css';

export const InnerStoryEditRoute: React.FC = () => {
	const {storyId} = useParams<{storyId: string}>();
	const {dispatch: dialogsDispatch} = useDialogsContext();
	const {
		dispatch: undoableStoriesDispatch,
		stories
	} = useUndoableStoriesContext();
	const mainContent = React.useRef<HTMLDivElement>(null);
	const {testStory} = useStoryLaunch();
	const story = storyWithId(stories, storyId);

	const selectedPassages = React.useMemo(
		() => story.passages.filter(passage => passage.selected),
		[story.passages]
	);

	const getCenter = React.useCallback(() => {
		if (!mainContent.current) {
			throw new Error(
				'Asked for the center of the main content, but it does not exist in the DOM yet'
			);
		}

		return {
			left:
				(mainContent.current.scrollLeft + mainContent.current.clientWidth / 2) /
				story.zoom,
			top:
				(mainContent.current.scrollTop + mainContent.current.clientHeight / 2) /
				story.zoom
		};
	}, [story.zoom]);

	const handleDeselectPassage = React.useCallback(
		(passage: Passage) =>
			undoableStoriesDispatch(deselectPassage(story, passage)),
		[story, undoableStoriesDispatch]
	);

	const handleDragPassages = React.useCallback(
		(change: Point) =>
			undoableStoriesDispatch(
				movePassages(
					story,
					story.passages.reduce<string[]>(
						(result, current) =>
							current.selected ? [...result, current.id] : result,
						[]
					),
					change.left,
					change.top
				),
				selectedPassages.length > 1
					? 'undoChange.movePassages'
					: 'undoChange.movePassages'
			),
		[selectedPassages.length, story, undoableStoriesDispatch]
	);

	const handleEditPassage = React.useCallback(
		(passage: Passage) =>
			dialogsDispatch({
				type: 'addDialog',
				component: PassageEditDialog,
				props: {passageId: passage.id, storyId: story.id}
			}),
		[dialogsDispatch, story.id]
	);

	const handleDeleteSelectedPassages = React.useCallback(() => {
		undoableStoriesDispatch(
			deletePassages(story, selectedPassages),
			selectedPassages.length > 1
				? 'undoChange.deletePassages'
				: 'undoChange.deletePassage'
		);
	}, [undoableStoriesDispatch, story, selectedPassages]);

	const handleEditSelectedPassage = React.useCallback(
		() =>
			dialogsDispatch(dispatch =>
				selectedPassages.forEach(passage =>
					dispatch({
						type: 'addDialog',
						component: PassageEditDialog,
						props: {passageId: passage.id, storyId: story.id}
					})
				)
			),
		[dialogsDispatch, selectedPassages, story.id]
	);

	const handleTestSelectedPassage = React.useCallback(() => {
		if (selectedPassages.length !== 1) {
			throw new Error(
				`Asked to test from selected passage, but {selectedPassages.length} are selected`
			);
		}

		testStory(story.id, selectedPassages[0].id);
	}, [selectedPassages, story.id, testStory]);

	const handleSelectPassage = React.useCallback(
		(passage: Passage, exclusive: boolean) =>
			undoableStoriesDispatch(selectPassage(story, passage, exclusive)),
		[story, undoableStoriesDispatch]
	);

	const handleSelectRect = React.useCallback(
		(rect: Rect, exclusive: boolean) => {
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
					exclusive ? [] : selectedPassages.map(passage => passage.id)
				)
			);
		},
		[selectedPassages, story, undoableStoriesDispatch]
	);

	// TODO: space bar scrolling

	return (
		<div className="story-edit-route">
			<StoryEditTopBar getCenter={getCenter} story={story} />
			<MainContent padded={false} ref={mainContent}>
				<MarqueeSelection
					container={mainContent}
					ignoreEventsOnSelector=".passage-card, .passage-toolbar"
					onSelectRect={handleSelectRect}
				/>
				<PassageToolbar
					onDelete={handleDeleteSelectedPassages}
					onEdit={handleEditSelectedPassage}
					onTest={handleTestSelectedPassage}
					targets={selectedPassages}
					zoom={story.zoom}
				/>
				<PassageMap
					onDeselect={handleDeselectPassage}
					onDrag={handleDragPassages}
					onEdit={handleEditPassage}
					onSelect={handleSelectPassage}
					passages={story.passages}
					tagColors={story.tagColors}
					zoom={story.zoom}
				/>
			</MainContent>
		</div>
	);
};

// This is a separate component so that the inner one can use
// `useEditorsContext()` and `useUndoableStoriesContext()` inside it.

export const StoryEditRoute: React.FC = () => (
	<UndoableStoriesContextProvider>
		<DialogsContextProvider>
			<InnerStoryEditRoute />
		</DialogsContextProvider>
	</UndoableStoriesContextProvider>
);
