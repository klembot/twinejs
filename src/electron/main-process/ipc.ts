import {dialog, ipcMain} from 'electron';
import {i18n} from './locales';
import {saveJsonFile} from './json-file';
import {openWithTempFile} from './open-with-temp-file';
import {deleteStory, renameStory, saveStoryHtml} from './story-file';

export function initIpc() {
	ipcMain.on('open-with-temp-file', (event, data: string, suffix: string) =>
		openWithTempFile(data, suffix)
	);

	ipcMain.on('save-json', (event, filename: string, data: any) => {
		saveJsonFile(filename, data);
	});

	// We need to ensure that all story file operations happen serially, because
	// they individually unlock and lock the story directory. Because file
	// operations are all asynchronous, we have to enforce this by hand.

	let storyTask = Promise.resolve();

	function queueStoryTask(func: () => void) {
		storyTask = storyTask.then(func, func);
	}

	ipcMain.on('save-story-html', (event, story, storyHtml) => {
		if (typeof storyHtml !== 'string') {
			throw new Error('Asked to save non-string as story HTML');
		}

		if (storyHtml.trim() === '') {
			throw new Error('Asked to save empty string as story HTML');
		}

		queueStoryTask(async () => {
			try {
				await saveStoryHtml(story, storyHtml);
				event.sender.send('story-saved', story);
			} catch (error) {
				dialog.showErrorBox(i18n.t('electron.errors.storySave'), error.message);
			}
		});
	});

	ipcMain.on('delete-story', (event, story) =>
		queueStoryTask(async () => {
			try {
				await deleteStory(story);
				event.sender.send('story-deleted', story);
			} catch (error) {
				dialog.showErrorBox(
					i18n.t('electron.errors.storyDelete'),
					error.message
				);
			}
		})
	);

	ipcMain.on('rename-story', (event, oldStory, newStory) =>
		queueStoryTask(async () => {
			try {
				await renameStory(oldStory, newStory);
				event.sender.send('story-renamed', oldStory, newStory);
			} catch (error) {
				dialog.showErrorBox(
					i18n.t('electron.errors.storyRename'),
					error.message
				);
			}
		})
	);
}
