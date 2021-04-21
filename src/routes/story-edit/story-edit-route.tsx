import * as React from 'react';
import {useParams} from 'react-router-dom';
import {useDialogsContext, Dialogs, DialogsContextProvider} from './dialogs';
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
	storyWithId,
	useStoriesContext
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
	const {dispatch: storiesDispatch} = useStoriesContext();
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
		(passage: Passage) => storiesDispatch(deselectPassage(story, passage)),
		[storiesDispatch, story]
	);

	const handleDragPassages = React.useCallback(
		(change: Point) =>
			storiesDispatch(
				movePassages(
					story,
					story.passages.reduce<string[]>(
						(result, current) =>
							current.selected ? [...result, current.id] : result,
						[]
					),
					change.left,
					change.top
				)
			),
		[storiesDispatch, story]
	);

	const handleEditPassage = React.useCallback(
		(passage: Passage) =>
			dialogsDispatch({
				type: 'addDialog',
				dialog: {type: 'passage', passageId: passage.id}
			}),
		[dialogsDispatch]
	);

	const handleDeleteSelectedPassages = React.useCallback(() => {
		undoableStoriesDispatch(
			deletePassages(story, selectedPassages),
			selectedPassages.length > 1
				? 'undoChange.deletePassages'
				: 'undoChange.deletePassage'
		);
	}, [undoableStoriesDispatch, story, selectedPassages]);

	const handleEditSelectedPassage = React.useCallback(() => {
		if (selectedPassages.length !== 1) {
			throw new Error(
				`Asked to edit selected passage, but ${selectedPassages.length} are selected`
			);
		}

		dialogsDispatch({
			type: 'addDialog',
			dialog: {type: 'passage', passageId: selectedPassages[0].id}
		});
	}, [dialogsDispatch, selectedPassages]);

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
			storiesDispatch(selectPassage(story, passage, exclusive)),
		[storiesDispatch, story]
	);

	function handleSelectRect(rect: Rect, additive: boolean) {
		// The rect we receive is in screen coordinates--we need to convert to
		// logical ones.

		const logicalRect: Rect = {
			height: rect.height / story.zoom,
			left: rect.left / story.zoom,
			top: rect.top / story.zoom,
			width: rect.width / story.zoom
		};

		storiesDispatch(
			selectPassagesInRect(
				story,
				logicalRect,
				additive
					? story.passages.reduce<string[]>(
							(result, passage) =>
								passage.selected ? [...result, passage.id] : result,
							[]
					  )
					: []
			)
		);
	}

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
			<Dialogs storyId={storyId} />
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
