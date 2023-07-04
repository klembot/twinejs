import * as React from 'react';
import {useParams} from 'react-router-dom';
import {MainContent} from '../../components/container/main-content';
import {DocumentTitle} from '../../components/document-title/document-title';
import {DialogsContextProvider} from '../../dialogs';
import {storyWithId} from '../../store/stories';
import {
	UndoableStoriesContextProvider,
	useUndoableStoriesContext
} from '../../store/undoable-stories';
import {MarqueeablePassageMap} from './marqueeable-passage-map';
import {PassageFuzzyFinder} from './passage-fuzzy-finder';
import {StoryEditToolbar} from './toolbar';
import {useInitialPassageCreation} from './use-initial-passage-creation';
import {usePassageChangeHandlers} from './use-passage-change-handlers';
import {useViewCenter} from './use-view-center';
import {useZoomShortcuts} from './use-zoom-shortcuts';
import {useZoomTransition} from './use-zoom-transition';
import './story-edit-route.css';

export const InnerStoryEditRoute: React.FC = () => {
	const {storyId} = useParams<{storyId: string}>();
	const {stories} = useUndoableStoriesContext();
	const story = storyWithId(stories, storyId);
	const [fuzzyFinderOpen, setFuzzyFinderOpen] = React.useState(false);
	const mainContent = React.useRef<HTMLDivElement>(null);
	const {getCenter, setCenter} = useViewCenter(story, mainContent);
	const {
		handleDeselectPassage,
		handleDragPassages,
		handleEditPassage,
		handleSelectPassage,
		handleSelectRect
	} = usePassageChangeHandlers(story);
	const visibleZoom = useZoomTransition(story.zoom, mainContent.current);

	useZoomShortcuts(story);
	useInitialPassageCreation(story, getCenter);

	return (
		<div className="story-edit-route">
			<DocumentTitle title={story.name} />
			<StoryEditToolbar
				getCenter={getCenter}
				onOpenFuzzyFinder={() => setFuzzyFinderOpen(true)}
				story={story}
			/>
			<MainContent grabbable padded={false} ref={mainContent}>
				<MarqueeablePassageMap
					container={mainContent}
					formatName={story.storyFormat}
					formatVersion={story.storyFormatVersion}
					onDeselect={handleDeselectPassage}
					onDrag={handleDragPassages}
					onEdit={handleEditPassage}
					onSelect={handleSelectPassage}
					onSelectRect={handleSelectRect}
					passages={story.passages}
					startPassageId={story.startPassage}
					tagColors={story.tagColors}
					visibleZoom={visibleZoom}
					zoom={story.zoom}
				/>
				<PassageFuzzyFinder
					onClose={() => setFuzzyFinderOpen(false)}
					onOpen={() => setFuzzyFinderOpen(true)}
					open={fuzzyFinderOpen}
					setCenter={setCenter}
					story={story}
				/>
			</MainContent>
		</div>
	);
};

// This is a separate component so that the inner one can use
// `useDialogsContext()` and `useUndoableStoriesContext()` inside it.

export const StoryEditRoute: React.FC = () => (
	<UndoableStoriesContextProvider>
		<DialogsContextProvider>
			<InnerStoryEditRoute />
		</DialogsContextProvider>
	</UndoableStoriesContextProvider>
);
