import {dialog, ipcMain} from 'electron';
import {i18n} from './locales';
import {saveJsonFile} from './json-file';
import {openWithTempFile} from './open-with-temp-file';
import {
	deleteStory,
	loadStories,
	renameStory,
	saveStoryHtml
} from './story-file';
import {loadStoryFormats} from './story-formats';
import {loadPrefs} from './prefs';

// It's possible for a second `save-story-html` message to be sent while one is
// in-progress. This race condition can cause saving to fail, so saves on a
// single story must be queued up. This uses the ID of the story object as key
// so that multiple stories can be saved independently; because of this, IDs
// must not change during an application session (but it's OK if they vary
// between sessions).

const saveStoryQueue: Record<string, Promise<void>> = {};

export function initIpc() {
	ipcMain.on('delete-story', async (event, story) => {
		try {
			await deleteStory(story);
			event.sender.send('story-deleted', story);
		} catch (error) {
			dialog.showErrorBox(
				i18n.t('electron.errors.storyDelete'),
				(error as Error).message
			);
			throw error;
		}
	});

	// These use handle() so that they can return data to the renderer process.

	ipcMain.handle('load-prefs', async () => {
		try {
			return await loadPrefs();
		} catch (error) {
			console.warn(`Could not load prefs, returning empty object: ${error}`);
			return {};
		}
	});

	ipcMain.handle('load-stories', loadStories);

	ipcMain.handle('load-story-formats', async () => {
		try {
			return await loadStoryFormats();
		} catch (error) {
			console.warn(
				`Could not load story formats, returning empty array: ${error}`
			);
			return [];
		}
	});

	ipcMain.on('open-with-temp-file', (event, data: string, suffix: string) =>
		openWithTempFile(data, suffix)
	);

	// This doesn't use handle() because state reducers in the renderer process
	// can't be be asynchronous--we have to send a signal back.

	ipcMain.on('rename-story', async (event, oldStory, newStory) => {
		try {
			await renameStory(oldStory, newStory);
			event.sender.send('story-renamed', oldStory, newStory);
		} catch (error) {
			dialog.showErrorBox(
				i18n.t('electron.errors.storyRename'),
				(error as Error).message
			);
			throw error;
		}
	});

	ipcMain.on('save-json', async (event, filename: string, data: any) => {
		try {
			await saveJsonFile(filename, data);
		} catch (error) {
			dialog.showErrorBox(
				i18n.t('electron.errors.jsonSave'),
				(error as Error).message
			);
			throw error;
		}
	});

	ipcMain.on('save-story-html', async (event, story, storyHtml) => {
		try {
			if (typeof storyHtml !== 'string') {
				throw new Error('Asked to save non-string as story HTML');
			}

			if (storyHtml.trim() === '') {
				throw new Error('Asked to save empty string as story HTML');
			}

			const savePromise = () =>
				saveStoryHtml(story, storyHtml)
					.then(() => event.sender.send('story-html-saved', story))
					.catch(error =>
						dialog.showErrorBox(
							i18n.t('electron.errors.storySave'),
							(error as Error).message
						)
					);

			console.log(`Queuing save for story ID ${story.id}`);

			if (!saveStoryQueue[story.id]) {
				saveStoryQueue[story.id] = savePromise();
			} else {
				saveStoryQueue[story.id].then(savePromise);
			}
		} catch (error) {
			dialog.showErrorBox(
				i18n.t('electron.errors.storySave'),
				(error as Error).message
			);
			throw error;
		}
	});
}
