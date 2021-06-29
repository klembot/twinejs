import {dialog, ipcMain} from 'electron';
import {i18n} from './locales';
import {saveJsonFile} from './json-file';
import {openWithTempFile} from './open-with-temp-file';
import {deleteStory, renameStory, saveStoryHtml} from './story-file';

export function initIpc() {
	ipcMain.on('delete-story', async (event, story) => {
		try {
			await deleteStory(story);
			event.sender.send('story-deleted', story);
		} catch (error) {
			dialog.showErrorBox(i18n.t('electron.errors.storyDelete'), error.message);
			throw error;
		}
	});

	ipcMain.on('open-with-temp-file', (event, data: string, suffix: string) =>
		openWithTempFile(data, suffix)
	);

	ipcMain.on('rename-story', async (event, oldStory, newStory) => {
		try {
			await renameStory(oldStory, newStory);
			event.sender.send('story-renamed', oldStory, newStory);
		} catch (error) {
			dialog.showErrorBox(i18n.t('electron.errors.storyRename'), error.message);
			throw error;
		}
	});

	ipcMain.on('save-json', async (event, filename: string, data: any) => {
		try {
			await saveJsonFile(filename, data);
		} catch (error) {
			dialog.showErrorBox(i18n.t('electron.errors.jsonSave'), error.message);
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

			await saveStoryHtml(story, storyHtml);
			event.sender.send('story-html-saved', story);
		} catch (error) {
			dialog.showErrorBox(i18n.t('electron.errors.storySave'), error.message);
			throw error;
		}
	});
}
