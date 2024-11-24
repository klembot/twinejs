import {ModeFactory} from 'codemirror';
import {Thunk} from 'react-hook-thunk-reducer';

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

export type StoryFormatToolbarButton = {
	type: 'button';
	command: string;
	disabled?: boolean;
	icon: string;
	iconOnly?: boolean;
	label: string;
};

export type StoryFormatToolbarMenuItem =
	| Omit<StoryFormatToolbarButton, 'icon'>
	| {type: 'separator'};

export type StoryFormatToolbarItem =
	| StoryFormatToolbarButton
	| {
			type: 'menu';
			disabled: boolean;
			icon: string;
			iconOnly?: boolean;
			items: StoryFormatToolbarMenuItem[];
			label: string;
	  };

export interface StoryFormatToolbarFactoryEnvironment {
	appTheme: 'dark' | 'light';
	foregroundColor: string;
	locale: string;
}

export type StoryFormatToolbarFactory = (
	editor: CodeMirror.Editor,
	environment: StoryFormatToolbarFactoryEnvironment
) => StoryFormatToolbarItem[];

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
	editorExtensions?: {
		twine?: {
			[semverSpec: string]: {
				codeMirror?: {
					commands?: Record<string, (editor: CodeMirror.Editor) => void>;
					mode?: ModeFactory<unknown>;
					toolbar?: StoryFormatToolbarFactory;
				};
				references?: {
					parsePassageText?: (text: string) => string[];
				};
			};
		};
	};
	hydrate?: string;
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
	| {
			type: 'create';
			props: Omit<StoryFormat, 'id' | 'loadState' | 'properties'>;
	  }
	| {type: 'delete'; id: string}
	| {type: 'update'; id: string; props: Partial<StoryFormat>};

export type StoryFormatsDispatch = React.Dispatch<
	StoryFormatsAction | Thunk<StoryFormatsState, StoryFormatsAction>
>;

export interface StoryFormatsContextProps {
	dispatch: StoryFormatsDispatch;
	formats: StoryFormatsState;
}
