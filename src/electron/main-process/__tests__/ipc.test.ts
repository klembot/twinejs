import {ipcMain} from 'electron';
import {initIpc} from '../ipc';
import {openWithTempFile} from '../open-with-temp-file';
import {saveJsonFile} from '../json-file';
import {deleteStory, renameStory, saveStoryHtml} from '../story-file';
import {Story} from '../../../store/stories';
import {fakeStory} from '../../../test-util';

jest.mock('../json-file');
jest.mock('../open-with-temp-file');
jest.mock('../story-file');

describe('initIpc()', () => {
	const deleteStoryMock = deleteStory as jest.Mock;
	const onMock = ipcMain.on as jest.Mock;
	const openWithTempFileMock = openWithTempFile as jest.Mock;
	const renameStoryMock = renameStory as jest.Mock;
	const saveJsonFileMock = saveJsonFile as jest.Mock;
	const saveStoryHtmlMock = saveStoryHtml as jest.Mock;

	beforeEach(() => {
		saveStoryHtmlMock.mockResolvedValue(undefined);
		initIpc();
	});

	describe('the listener it adds for delete-story events', () => {
		let listener: any[];
		let story: Story;

		beforeEach(() => {
			listener = onMock.mock.calls.find(call => call[0] === 'delete-story');
			story = fakeStory();
		});

		it('calls deleteStory()', async () => {
			expect(listener).not.toBeUndefined();
			listener[1]({sender: {send: jest.fn()}}, story);
			expect(deleteStoryMock).toBeCalledWith(story);
		});

		it('sends back a story-deleted event', async () => {
			const send = jest.fn();

			expect(listener).not.toBeUndefined();
			await listener[1]({sender: {send}}, story, 'test-story-html');
			expect(send.mock.calls).toEqual([['story-deleted', story]]);
		});
	});

	describe('the listener it adds for rename-story events', () => {
		let listener: any[];
		let newStory: Story;
		let oldStory: Story;

		beforeEach(() => {
			listener = onMock.mock.calls.find(call => call[0] === 'rename-story');
			oldStory = fakeStory();
			newStory = {...oldStory, name: 'new-name'};
		});

		it('calls renameStory()', async () => {
			expect(listener).not.toBeUndefined();
			listener[1]({sender: {send: jest.fn()}}, oldStory, newStory);
			expect(renameStoryMock.mock.calls).toEqual([[oldStory, newStory]]);
		});

		it('sends back a story-renamed event', async () => {
			const send = jest.fn();

			expect(listener).not.toBeUndefined();
			await listener[1]({sender: {send}}, oldStory, newStory);
			expect(send.mock.calls).toEqual([['story-renamed', oldStory, newStory]]);
		});
	});

	it('adds a listener for open-with-temp-files events that calls openWithTempFile()', async () => {
		const listener = onMock.mock.calls.find(
			call => call[0] === 'open-with-temp-file'
		);

		expect(listener).not.toBeUndefined();
		listener[1]({}, 'test-file-contents', 'test-file-suffix');
		expect(openWithTempFileMock).toBeCalledWith(
			'test-file-contents',
			'test-file-suffix'
		);
	});

	it('adds a listener for save-json events that calls openWithTempFile()', async () => {
		const listener = onMock.mock.calls.find(call => call[0] === 'save-json');
		const testData = {};

		expect(listener).not.toBeUndefined();
		listener[1]({}, 'test-filename', testData);
		expect(saveJsonFileMock).toBeCalledWith('test-filename', testData);
	});

	describe('the listener it adds for save-story-html events', () => {
		let listener: any[];
		let story: Story;

		beforeEach(() => {
			jest.spyOn(console, 'log').mockReturnValue();
			listener = onMock.mock.calls.find(call => call[0] === 'save-story-html');
			story = fakeStory();
		});

		it('calls saveStoryHtml()', async () => {
			expect(listener).not.toBeUndefined();
			await listener[1]({sender: {send: jest.fn()}}, story, 'test-story-html');
			expect(saveStoryHtmlMock).toBeCalledWith(story, 'test-story-html');
		});

		it('queues calls to saveStoryHtml() for the same story ID', async () => {
			saveStoryHtmlMock.mockImplementation(() => new Promise(() => {}));
			listener[1]({sender: {send: jest.fn()}}, story, 'test-story-html');
			listener[1]({sender: {send: jest.fn()}}, story, 'test-story-html');
			await Promise.resolve();
			await Promise.resolve();
			expect(saveStoryHtmlMock).toBeCalledTimes(1);
		});

		it("doesn't queue calls to saveStoryHtml() for the different story IDs", async () => {
			const story1 = fakeStory();
			const story2 = fakeStory();

			story1.id = 'mock-id-1';
			story2.id = 'mock-id-2';

			saveStoryHtmlMock.mockImplementation(() => new Promise(() => {}));
			listener[1]({sender: {send: jest.fn()}}, story1, 'test-story-html');
			listener[1]({sender: {send: jest.fn()}}, story2, 'test-story-html');
			await Promise.resolve();
			await Promise.resolve();
			expect(saveStoryHtmlMock).toBeCalledTimes(2);
		});

		it('sends back a story-html-saved event', async () => {
			const send = jest.fn();

			expect(listener).not.toBeUndefined();
			await listener[1]({sender: {send}}, story, 'test-story-html');
			expect(send.mock.calls).toEqual([['story-html-saved', story]]);
		});

		it('rejects if asked to save an empty string', async () => {
			expect(listener).not.toBeUndefined();
			await expect(
				listener[1]({sender: {send: jest.fn()}}, story, '')
			).rejects.toBeInstanceOf(Error);
			expect(saveStoryHtmlMock).not.toHaveBeenCalled();
		});

		it('rejects if asked to save a non-string', async () => {
			expect(listener).not.toBeUndefined();
			await expect(
				listener[1]({sender: {send: jest.fn()}}, story, null)
			).rejects.toBeInstanceOf(Error);
			expect(saveStoryHtmlMock).not.toHaveBeenCalled();
			await expect(
				listener[1]({sender: {send: jest.fn()}}, story, undefined)
			).rejects.toBeInstanceOf(Error);
			expect(saveStoryHtmlMock).not.toHaveBeenCalled();
			await expect(
				listener[1]({sender: {send: jest.fn()}}, story, false)
			).rejects.toBeInstanceOf(Error);
			expect(saveStoryHtmlMock).not.toHaveBeenCalled();
			await expect(
				listener[1](
					{sender: {send: jest.fn()}},
					story,
					Promise.resolve('some html')
				)
			).rejects.toBeInstanceOf(Error);
			expect(saveStoryHtmlMock).not.toHaveBeenCalled();
		});
	});
});
