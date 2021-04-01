import {loadAllFormatProperties, loadFormatProperties} from '../actions';
import {StoryFormat, StoryFormatProperties} from '../story-formats.types';
import {fetchStoryFormatProperties} from '../../../util/fetch-story-format-properties';
import {
	fakeFailedStoryFormat,
	fakeLoadedStoryFormat,
	fakePendingStoryFormat,
	fakeStoryFormatProperties
} from '../../../test-util/fakes';

jest.mock('../../../util/fetch-story-format-properties');

describe('loadAllFormatProperties', () => {
	it.todo('loads all formats either in unloaded or error loadState');

	it.todo('does nothing with formats that are loaded or are loading');

	it.todo(
		'returns a promise that resolves when all formats have loaded or failed'
	);
});

describe('loadFormatProperties', () => {
	let fetchPropertiesMock = fetchStoryFormatProperties as jest.Mock;
	let dispatch: jest.Mock;
	let format: StoryFormat;

	beforeEach(() => {
		dispatch = jest.fn();
		fetchPropertiesMock.mockReset();
		format = fakePendingStoryFormat();
	});

	it('sets the format state to loading while properties are being fetched', () => {
		fetchPropertiesMock.mockImplementationOnce(() => new Promise(() => {}));
		loadFormatProperties(dispatch, format);
		expect(dispatch.mock.calls).toEqual([
			[{type: 'update', id: format.id, props: {loadState: 'loading'}}]
		]);
	});

	describe('when fetching properties succeeds', () => {
		let properties: StoryFormatProperties;

		beforeEach(() => {
			properties = fakeStoryFormatProperties();
			fetchPropertiesMock.mockImplementationOnce((url: string) => {
				if (url !== format.url) {
					throw new Error('Asked to load incorrect story format URL');
				}

				return Promise.resolve(properties);
			});
		});

		it('sets the format properties and state as loaded', async () => {
			loadFormatProperties(dispatch, format);
			await Promise.resolve();
			expect(dispatch.mock.calls.length).toBe(2);

			// First call is tested above.

			expect(dispatch.mock.calls[1]).toEqual([
				{
					type: 'update',
					id: format.id,
					props: {loadState: 'loaded', properties}
				}
			]);
		});

		it('loads the format properties even if the format previously failed to load', async () => {
			format = fakeFailedStoryFormat();
			loadFormatProperties(dispatch, format);
			await Promise.resolve();
			expect(dispatch.mock.calls).toEqual([
				[{type: 'update', id: format.id, props: {loadState: 'loading'}}],
				[
					{
						type: 'update',
						id: format.id,
						props: {loadState: 'loaded', properties}
					}
				]
			]);
		});
	});

	describe('when fetching properties fails', () => {
		let loadError: Error;

		beforeEach(() => {
			loadError = new Error();

			fetchPropertiesMock.mockImplementationOnce((url: string) => {
				if (url !== format.url) {
					throw new Error('Asked to load incorrect story format URL');
				}

				return Promise.reject(loadError);
			});
		});

		it("sets the load error and state as 'error' if loading properties fails", async () => {
			try {
				await loadFormatProperties(dispatch, format);
			} catch (e) {
				// This is tested separately.
			}

			await Promise.resolve();
			expect(dispatch.mock.calls.length).toBe(2);

			// First call is tested above.

			expect(dispatch.mock.calls[1]).toEqual([
				{type: 'update', id: format.id, props: {loadError, loadState: 'error'}}
			]);
		});

		it('rethrows the loading error to the caller', async () => {
			let thrownError: Error | undefined = undefined;

			try {
				await loadFormatProperties(dispatch, format);
			} catch (e) {
				thrownError = e;
			}

			expect(thrownError).toBe(loadError);
		});
	});

	it('does nothing if the format is already loaded', async () => {
		format = fakeLoadedStoryFormat();
		loadFormatProperties(dispatch, format);
		await Promise.resolve();
		expect(dispatch.mock.calls).toEqual([]);
	});
});
