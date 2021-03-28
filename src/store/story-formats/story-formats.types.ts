interface BaseStoryFormat {
	id: string;
	loadState: 'unloaded' | 'loading' | 'loaded' | 'error';
	name: string;
	url: string;
	userAdded: boolean;
	version: string;
}

/**
 * States for a story format.
 */
export type StoryFormat =
	| (BaseStoryFormat & {loadState: 'unloaded'})
	| (BaseStoryFormat & {loadState: 'loading'})
	| (BaseStoryFormat & {loadState: 'error'; loadError: Error})
	| (BaseStoryFormat & {
			loadState: 'loaded';
			properties: StoryFormatProperties;
	  });

/**
 * Properties available once a story format is loaded. Note that some there is
 * some overlap between this and StoryFormat--this is so that we know certain
 * things, mainly the format name and version, before loading.
 * @see
 * https://github.com/iftechfoundation/twine-specs/blob/master/twine-2-storyformats-spec.md
 */
export interface StoryFormatProperties {
	author?: string;
	description?: string;
	image?: string;
	license?: string;
	name: string;
	proofing?: boolean;
	source: string;
	url?: string;
	version: string;
}

export type StoryFormatsState = StoryFormat[];

export type StoryFormatsAction =
	| {type: 'init'; state: StoryFormat[]}
	| {type: 'repair'}
	| {type: 'create'; props: StoryFormat}
	| {type: 'delete'; id: string}
	| {type: 'update'; id: string; props: Partial<StoryFormat>};

export type StoryFormatsDispatch = React.Dispatch<StoryFormatsAction>;

export interface StoryFormatsContextProps {
	dispatch: StoryFormatsDispatch;
	formats: StoryFormatsState;
}
