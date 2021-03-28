import {TwineElectronWindow} from '../../../../electron/electron.types';
import {
	StoriesAction,
	StoriesState,
	Story,
	storyWithId,
	storyWithName
} from '../../../stories';
import {
	formatWithNameAndVersion,
	StoryFormat,
	StoryFormatsState
} from '../../../story-formats';
import {getAppInfo} from '../../../../util/app-info';

// Certain passage property changes can be ignored, because they will not actually
// be saved to the filesystem.

const ignoredPassageProps = ['selected'];

function saveStory(story: Story, formats: StoryFormat[]) {
	const {twineElectron} = window as TwineElectronWindow;

	if (!twineElectron) {
		throw new Error('Electron bridge is not present on window.');
	}

	let format: StoryFormat | null = null;

	try {
		format = formatWithNameAndVersion(
			formats,
			story.storyFormat,
			story.storyFormatVersion
		);
	} catch (e) {
		console.warn(
			`Could not find format for story "${story.name}", wanted "${story.storyFormat}" version "${story.storyFormatVersion}". Saving unpublished.`
		);
	}

	twineElectron.ipcRenderer.send('save-story', story, format, getAppInfo());
}

// When a story is deleted, we need to be able to look up information about it
// from the last state.

let lastState: StoriesState;

export function saveMiddleware(
	state: StoriesState,
	action: StoriesAction,
	formatState: StoryFormatsState
) {
	const {twineElectron} = window as TwineElectronWindow;

	if (!twineElectron) {
		throw new Error('Electron bridge is not present on window.');
	}

	switch (action.type) {
		case 'createStory':
			if (action.props.name) {
				saveStory(storyWithName(state, action.props.name), formatState);
			} else {
				console.warn(
					"Story was created but with no name specified, can't persist it",
					action.props
				);
			}
			break;

		case 'deleteStory':
			// We have to look up the story in our saved last state to know what file
			// to delete.
			twineElectron.ipcRenderer.send(
				'delete-story',
				storyWithId(lastState, action.storyId)
			);
			break;

		case 'updateStory':
			if (action.props.name) {
				// The story has been renamed, and we need to process it
				// specially. We rename the story file, then save it to catch
				// any other changes.

				const oldStory = storyWithId(lastState, action.storyId);
				const newStory = storyWithId(state, action.storyId);

				twineElectron.ipcRenderer.once('story-renamed', () =>
					saveStory(newStory, formatState)
				);
				twineElectron.ipcRenderer.send(
					'rename-story',
					oldStory,
					newStory
				);
			} else {
				// An ordinary update.

				saveStory(storyWithId(state, action.storyId), formatState);
			}
			break;

		case 'createPassage':
		case 'deletePassage':
			saveStory(storyWithId(state, action.storyId), formatState);
			break;

		case 'updatePassage':
			// Skip updates that wouldn't be saved.
			if (
				Object.keys(action.props).some(
					prop => !ignoredPassageProps.includes(prop)
				)
			) {
				saveStory(storyWithId(state, action.storyId), formatState);
			}
			break;

		default:
			console.warn('Not implemented yet');
	}

	lastState = {...state};
}
