import setup from '..';
import {fakeVuexStore} from '@/test-utils/fakes';

describe('electron-ipc persistence', () => {
	let store;

	beforeEach(() => {
		global.twineElectron = {
			hydrate: {},
			ipcRenderer: {once: jest.fn(), send: jest.fn()}
		};
		store = fakeVuexStore();
	});
	afterAll(() => delete global.twineElectron);

	it('loads preferences from the twineElectron global', () => {
		const prefs = {testPref: true, testPref2: false};

		global.twineElectron.hydrate = {prefs};
		setup(store);
		expect(store.dispatch).toHaveBeenCalledWith('pref/update', prefs);
	});

	it('loads story formats from the twineElectron global', () => {
		const storyFormats = [
			{name: 'test-format', version: '1.2.3'},
			{name: 'test-format2', version: '4.5.6'}
		];

		global.twineElectron.hydrate = {storyFormats};
		setup(store);
		expect(
			store.dispatch.mock.calls.filter(
				call => call[0] === 'storyFormat/createFormat'
			).length
		).toBe(2);
		storyFormats.forEach(format => {
			expect(store.dispatch).toHaveBeenCalledWith(
				'storyFormat/createFormat',
				format
			);
		});
	});

	it('loads stories from the twineElectron global', () => {
		const stories = [
			{data: '<tw-storydata></tw-storydata>', mtime: new Date('1/1/2009')},
			{data: '<tw-storydata></tw-storydata>', mtime: new Date('1/1/2019')}
		];

		global.twineElectron.hydrate = {stories};
		setup(store);
		expect(
			store.dispatch.mock.calls.filter(call => call[0] === 'story/createStory')
				.length
		).toBe(2);
	});

	it('sends a matching save-story IPC message when a story is created', () => {
		/* We need the resulting story to be in state, so we crib from what is already there. */

		setup(store);
		store.dispatch('story/createStory', {
			storyProps: store.state.story.stories[0]
		});
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledTimes(1);
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledWith(
			'save-story',
			store.state.story.stories[0],
			store.state.storyFormat.formats[0],
			store.state.appInfo
		);
	});

	it('sends a matching save-story IPC message when a story is updated', () => {
		setup(store);
		store.dispatch('story/updateStory', {
			storyId: store.state.story.stories[0].id,
			storyProps: {}
		});
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledTimes(1);
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledWith(
			'save-story',
			store.state.story.stories[0],
			store.state.storyFormat.formats[0],
			store.state.appInfo
		);
	});

	it('sends a rename-story IPC message when a story is renamed, then a save-story IPC message once a renamed-story message is received', () => {
		const story = store.state.story.stories[0];

		setup(store);
		store.dispatch('story/updateStory', {
			storyId: store.state.story.stories[0].id,
			storyProps: {name: story.name + ' test'}
		});

		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledTimes(1);

		/* The same argument twice because the story isn't actually changed during dispatch. */

		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledWith(
			'rename-story',
			story,
			story
		);
		expect(global.twineElectron.ipcRenderer.once).toHaveBeenCalledTimes(1);
		expect(global.twineElectron.ipcRenderer.once.mock.calls[0][0]).toBe(
			'story-renamed'
		);
		global.twineElectron.ipcRenderer.once.mock.calls[0][1]();
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledTimes(2);
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenLastCalledWith(
			'save-story',
			store.state.story.stories[0],
			store.state.storyFormat.formats[0],
			store.state.appInfo
		);
	});

	it('sends a matching delete-story IPC message when a story is deleted', () => {
		setup(store);
		store.dispatch('story/deleteStory', {
			storyId: store.state.story.stories[0].id
		});
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledTimes(1);
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledWith(
			'delete-story',
			store.state.story.stories[0]
		);
	});

	it('sends a save-story IPC message when a passage is created', () => {
		setup(store);
		store.dispatch('story/createPassage', {
			storyId: store.state.story.stories[0].id,
			passageProps: {}
		});
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledTimes(1);
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledWith(
			'save-story',
			store.state.story.stories[0],
			store.state.storyFormat.formats[0],
			store.state.appInfo
		);
	});

	it('sends a save-story IPC message when a passage is updated', () => {
		setup(store);
		store.dispatch('story/updatePassage', {
			passageId: store.state.story.stories[0].passages[0].id,
			storyId: store.state.story.stories[0].id,
			passageProps: {name: 'mock-passage'}
		});
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledTimes(1);
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledWith(
			'save-story',
			store.state.story.stories[0],
			store.state.storyFormat.formats[0],
			store.state.appInfo
		);
	});

	it("does not send a save-story IPC message if only a passage's selection status has changed", () => {
		setup(store);
		store.dispatch('story/updatePassage', {
			passageId: store.state.story.stories[0].passages[0].id,
			storyId: store.state.story.stories[0].id,
			passageProps: {selected: true}
		});
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledTimes(0);
	});

	it('sends a save-story IPC message when a passage is deleted', () => {
		setup(store);
		store.dispatch('story/deletePassage', {
			passageId: store.state.story.stories[0].passages[0].id,
			storyId: store.state.story.stories[0].id
		});
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledTimes(1);
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledWith(
			'save-story',
			store.state.story.stories[0],
			store.state.storyFormat.formats[0],
			store.state.appInfo
		);
	});

	it('sends a save-json IPC message when a preference is updated', () => {
		setup(store);
		store.dispatch('pref/update', {});
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledTimes(1);
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledWith(
			'save-json',
			'prefs.json',
			store.state.pref
		);
	});

	it('sends a save-json IPC message when a story format is created', () => {
		const format = store.state.storyFormat.formats[0];

		setup(store);
		store.dispatch('storyFormat/createFormat', {});
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledTimes(1);
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledWith(
			'save-json',
			'story-formats.json',
			[
				expect.objectContaining({
					id: format.id,
					name: format.name,
					version: format.version,
					url: format.url,
					userAdded: format.userAdded
				})
			]
		);
	});

	it('does not send a save-json IPC message when a story format is updated', () => {
		setup(store);
		store.dispatch('storyFormat/updateFormat', {});
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledTimes(0);
	});

	it('sends a save-json IPC message when a story format is deleted', () => {
		const format = store.state.storyFormat.formats[0];

		setup(store);
		store.dispatch('storyFormat/deleteFormat', {});
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledTimes(1);
		expect(global.twineElectron.ipcRenderer.send).toHaveBeenCalledWith(
			'save-json',
			'story-formats.json',
			[
				expect.objectContaining({
					id: format.id,
					name: format.name,
					version: format.version,
					url: format.url,
					userAdded: format.userAdded
				})
			]
		);
	});

	it('throws an error if it sees a mutation type it does not recognize', () => {
		setup(store);
		expect(() => store.dispatch('nonexistent mutation')).toThrow();
	});
});
