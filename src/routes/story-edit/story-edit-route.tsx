import * as React from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {Point, Rect} from '../../util/geometry';
import {MainContent} from '../../components/container/main-content';
import {MarqueeSelection} from '../../components/marquee-selection';
import {GraphPaper} from '../../components/surface/graph-paper';
import {
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
import './story-edit-route.css';
import {StoryEditTopBar} from './top-bar';
import launchStory from '../../util/launch-story';

export const StoryEditRoute: React.FC = () => {
	const {storyId} = useParams<{storyId: string}>();
	const {dispatch, stories} = useStoriesContext();
	const history = useHistory();
	const mainContent = React.useRef<HTMLDivElement>(null);
	const story = storyWithId(stories, storyId);

	const selectedPassages = React.useMemo(
		() => story.passages.filter(passage => passage.selected),
		[story.passages]
	);

	// TODO: incorporate apparent zoom
	// TODO: graph paper doesn't fill body
	// TODO: add extra space at bottom and right

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
		(passage: Passage) => deselectPassage(dispatch, story, passage),
		[dispatch, story]
	);

	const handleDragPassages = React.useCallback(
		(change: Point) =>
			movePassages(
				dispatch,
				story,
				story.passages.reduce<string[]>(
					(result, current) =>
						current.selected ? [...result, current.id] : result,
					[]
				),
				change.left,
				change.top
			),
		[dispatch, story]
	);

	const handleEditPassage = React.useCallback(
		(passage: Passage) =>
			history.push(`/stories/${story.id}/passages/${passage.id}`),
		[history, story.id]
	);

	const handleDeleteSelectedPassages = React.useCallback(() => {
		throw new Error('Not implemented yet');
	}, []);

	const handleEditSelectedPassage = React.useCallback(() => {
		console.log('hello?');
		if (selectedPassages.length !== 1) {
			throw new Error(
				`Asked to edit selected passage, but ${selectedPassages.length} are selected`
			);
		}

		history.push(`/stories/${story.id}/passages/${selectedPassages[0].id}`);
	}, [history, selectedPassages, story.id]);

	const handleTestSelectedPassage = React.useCallback(() => {
		if (selectedPassages.length !== 1) {
			throw new Error(
				`Asked to test from selected passage, but {selectedPassages.length} are selected`
			);
		}

		console.log('startId', selectedPassages[0].id);

		launchStory(stories, story.id, {
			mode: 'test',
			startId: selectedPassages[0].id
		});
	}, [selectedPassages, stories, story.id]);

	const handleSelectPassage = React.useCallback(
		(passage: Passage, exclusive: boolean) =>
			selectPassage(dispatch, story, passage, exclusive),
		[dispatch, story]
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

		selectPassagesInRect(
			dispatch,
			story,
			logicalRect,
			additive
				? story.passages.reduce<string[]>(
						(result, passage) =>
							passage.selected ? [...result, passage.id] : result,
						[]
				  )
				: []
		);
	}

	// TODO: space bar scrolling

	return (
		<div className="story-edit-route">
			<StoryEditTopBar getCenter={getCenter} story={story} />
			<MainContent padded={false} ref={mainContent}>
				<GraphPaper zoom={story.zoom} />
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
