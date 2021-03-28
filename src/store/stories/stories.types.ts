import {Color} from '../../util/color';

/**
 * A single passage in a story.
 */
export interface Passage {
	/**
	 * Height of the passage in pixels.
	 */
	height: number;
	/**
	 * Should the passage be drawn highlighted?
	 */
	highlighted: boolean;
	/**
	 * GUID identifying the passage.
	 */
	id: string;
	/**
	 * Left (e.g. X) position of the top-left corner of the passage in pixels.
	 */
	left: number;
	/**
	 * Name of the passage.
	 */
	name: string;
	/**
	 * Is the passage currently selected by the user?
	 */
	selected: boolean;
	/**
	 * ID of the parent story.
	 */
	story: string;
	/**
	 * Passage tags.
	 */
	tags: string[];
	/**
	 * Body text of the passage.
	 */
	text: string;
	/**
	 * Top (e.g. Y) position of the top-left corner of the passage in pixels.
	 */
	top: number;
	/**
	 * Width of the passage in pixels.
	 */
	width: number;
}

export interface Story {
	/**
	 * IFID of the story. An IFID should stay stable when a story is imported or exported.
	 */
	ifid: string;
	/**
	 * GUID identifying the story.
	 */
	id: string;
	/**
	 * When the story was last changed.
	 */
	lastUpdate: Date;
	/**
	 * Name of the story.
	 */
	name: string;
	/**
	 * Passages in the story.
	 */
	passages: Passage[];
	/**
	 * Author-created JavaScript associated with the story.
	 */
	script: string;
	/**
	 * Should passages snap to a grid?
	 */
	snapToGrid: boolean;
	/**
	 * ID of the passage that the story begins at.
	 */
	startPassage: string;
	/**
	 * Name of the story format the story uses.
	 */
	storyFormat: string;
	/**
	 * Version of the story format that this story uses.
	 */
	storyFormatVersion: string;
	/**
	 * Author-created CSS associated with the story.
	 */
	stylesheet: string;
	/**
	 * Author-specified colors for passage tags.
	 */
	tagColors: TagColors;
	/**
	 * Zoom level the story is displayed at.
	 */
	zoom: number;
}

export type StoriesState = Story[];

export type StoriesAction =
	| {type: 'init'; state: Story[]}
	| {type: 'repair'}
	| {type: 'createStory'; props: Partial<Story>}
	| {type: 'updateStory'; props: Partial<Story>; storyId: string}
	| {type: 'deleteStory'; storyId: string}
	| {type: 'createPassage'; props: Partial<Passage>; storyId: string}
	| {
			type: 'updatePassage';
			passageId: string;
			props: Partial<Passage>;
			storyId: string;
	  }
	| {type: 'deletePassage'; passageId: string; storyId: string};

export type StoriesDispatch = React.Dispatch<StoriesAction>;

export interface PassageSearchResult {
	/**
	 * HTML of the passage name with instances of the search string set off with
	 * <mark> tags.
	 */
	nameHighlighted: string;
	/**
	 * The passage that was searched.
	 */
	passage: Passage;
	/**
	 * Number of search hits on the passage.
	 */
	textMatches: number;
	/**
	 * HTML of the passage text with instances of the search string set off with
	 * <mark> tags.
	 */
	textHighlighted: string;
}

export interface StorySearchFlags {
	includePassageNames?: boolean;
	matchCase?: boolean;
	useRegexes?: boolean;
}

export type TagColors = Record<string, Exclude<Color, 'none'>>;

export interface StoriesContextProps {
	dispatch: React.Dispatch<StoriesAction>;
	stories: Story[];
}
