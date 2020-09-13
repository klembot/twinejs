import * as actions from '../actions';
import {actionCommits, asyncActionCommits} from '@/test-utils/vuex';
import {
	fakePendingStoryFormatObject,
	fakeLoadedStoryFormatObject
} from '@/test-utils/fakes';
import requestStoryFormat from '@/util/request-story-format';

jest.mock('@/util/request-story-format');

let format;
const getters = {
	formatWithId(id) {
		if (id === format.id) {
			return format;
		}
	},
	latestFormat(name) {
		if (name === format.name) {
			return format;
		}
	}
};

beforeEach(() => {
	format = fakePendingStoryFormatObject({loading: false, userAdded: false});
	process.env.BASE_URL = 'mock-base-url';
});

describe('story format actions', () => {
	describe('createFormat()', () => {
		it('passes through a creation mutation', () => {
			const payload = {storyFormatProps: fakePendingStoryFormatObject()};

			expect(actionCommits(actions.createFormat, payload)).toEqual([
				['createFormat', payload]
			]);
		});
	});

	describe('createFormatFromUrl()', () => {
		const mockUrl = 'mock-new-format-url';
		const mockStoryFormat = {
			name: 'mock-format',
			version: '1.0.0',
			source: 'mock format source'
		};

		it('creates a format based on properties loaded for the format', async () => {
			requestStoryFormat.mockImplementation(url => {
				if (url === mockUrl) {
					return mockStoryFormat;
				}

				throw new Error(`Requested an unexpected URL: ${url}`);
			});

			expect(
				await asyncActionCommits(
					actions.createFormatFromUrl,
					{storyFormatUrl: mockUrl},
					getters
				)
			).toContainEqual([
				'createFormat',
				{
					storyFormatProps: expect.objectContaining({
						name: mockStoryFormat.name,
						properties: mockStoryFormat,
						url: mockUrl,
						userAdded: true,
						version: mockStoryFormat.version
					})
				}
			]);
		});

		it('sets an error if the request for the format fails', async () => {
			requestStoryFormat.mockImplementation(() => {
				throw new Error();
			});

			expect(
				await asyncActionCommits(
					actions.createFormatFromUrl,
					{storyFormatUrl: mockUrl},
					getters
				)
			).toContainEqual(['setCreateFormatFromUrlError', expect.any(Error)]);
		});

		it('sets an error if the format does not have a name', async () => {
			requestStoryFormat.mockImplementation(url => {
				if (url === mockUrl) {
					return {...mockStoryFormat, name: undefined};
				}

				throw new Error(`Requested an unexpected URL: ${url}`);
			});

			expect(
				await asyncActionCommits(
					actions.createFormatFromUrl,
					{storyFormatUrl: mockUrl},
					getters
				)
			).toContainEqual(['setCreateFormatFromUrlError', expect.any(Error)]);
		});

		it('sets an error if the format does not have a version', async () => {
			requestStoryFormat.mockImplementation(url => {
				if (url === mockUrl) {
					return {...mockStoryFormat, version: undefined};
				}

				throw new Error(`Requested an unexpected URL: ${url}`);
			});

			expect(
				await asyncActionCommits(
					actions.createFormatFromUrl,
					{storyFormatUrl: mockUrl},
					getters
				)
			).toContainEqual(['setCreateFormatFromUrlError', expect.any(Error)]);
		});

		it('sets an error if a format with the same exact name and version already exists', async () => {
			requestStoryFormat.mockImplementation(url => {
				if (url === mockUrl) {
					return {
						...mockStoryFormat,
						name: format.name,
						version: format.version
					};
				}

				throw new Error(`Requested an unexpected URL: ${url}`);
			});

			expect(
				await asyncActionCommits(
					actions.createFormatFromUrl,
					{storyFormatUrl: mockUrl},
					getters
				)
			).toContainEqual(['setCreateFormatFromUrlError', expect.any(Error)]);
		});
	});

	describe('deleteFormat()', () => {
		it('passes through a deletion mutation', () => {
			const payload = {storyFormatId: format.id};

			expect(actionCommits(actions.deleteFormat, payload, getters)).toEqual([
				['deleteFormat', payload]
			]);
		});

		it('throws an error if there is no format with the ID in the store', () =>
			expect(() =>
				actionCommits(
					actions.deleteFormat,
					{storyFormatId: format.id + 'nonexistent'},
					getters
				)
			).toThrow());
	});

	describe('loadAllFormats()', () => {
		it.todo('resolves when all formats have loaded');
		it.todo('resolves even if one format encounters an error loading');
	});

	describe('loadFormat()', () => {
		beforeEach(() => jest.resetAllMocks());

		it('loads format properties using its source property', async () => {
			requestStoryFormat.mockImplementation(url => {
				if (url === process.env.BASE_URL + format.url) {
					return {source: 'mock format source'};
				}

				throw new Error(`Requested an unexpected URL: ${url}`);
			});

			expect(
				await asyncActionCommits(
					actions.loadFormat,
					{storyFormatId: format.id},
					getters
				)
			).toContainEqual([
				'updateFormat',
				{
					storyFormatId: format.id,
					storyFormatProps: {
						loadError: null,
						loading: false,
						properties: {source: 'mock format source'}
					}
				}
			]);
		});

		it('sets the loading prop to true while waiting for the request to complete', async () => {
			requestStoryFormat.mockImplementation(url => {
				if (url === process.env.BASE_URL + format.url) {
					return {source: 'mock format source'};
				}

				throw new Error(`Requested an unexpected URL: ${url}`);
			});

			const commits = await asyncActionCommits(
				actions.loadFormat,
				{storyFormatId: format.id},
				getters
			);

			expect(commits[0]).toEqual([
				'updateFormat',
				{
					storyFormatId: format.id,
					storyFormatProps: expect.objectContaining({loading: true})
				}
			]);

			expect(commits[1]).toEqual([
				'updateFormat',
				{
					storyFormatId: format.id,
					storyFormatProps: expect.objectContaining({loading: false})
				}
			]);
		});

		it('sets the loadError property of the format if the request to load fails', async () => {
			jest.spyOn(global.console, 'warn').mockImplementation(() => {});

			const error = new Error('test error');

			requestStoryFormat.mockImplementation(() => Promise.reject(error));

			expect(
				await asyncActionCommits(
					actions.loadFormat,
					{storyFormatId: format.id},
					getters
				)
			).toContainEqual([
				'updateFormat',
				{
					storyFormatId: format.id,
					storyFormatProps: expect.objectContaining({
						loadError: error,
						loading: false,
						properties: null
					})
				}
			]);
		});

		it('resolves even if the request to load fails', async () => {
			jest.spyOn(global.console, 'warn').mockImplementation(() => {});

			let passed = true;
			const error = new Error('test error');

			requestStoryFormat.mockImplementation(() => Promise.reject(error));

			try {
				await asyncActionCommits(
					actions.loadFormat,
					{storyFormatId: format.id},
					getters
				);
			} catch (e) {
				passed = false;
			}

			expect(passed).toBe(true);
		});

		it('prepends BASE_URL when loading non-user-added formats', async () => {
			format.userAdded = false;
			await asyncActionCommits(
				actions.loadFormat,
				{storyFormatId: format.id},
				getters
			);
			expect(requestStoryFormat).toHaveBeenCalledWith(
				process.env.BASE_URL + format.url
			);
		});

		it('uses the format URL as-is if it is not user-added', async () => {
			format.userAdded = true;
			await asyncActionCommits(
				actions.loadFormat,
				{storyFormatId: format.id},
				getters
			);
			expect(requestStoryFormat).toHaveBeenCalledWith(format.url);
		});

		it('does nothing if the format has already been loaded', async () => {
			format = fakeLoadedStoryFormatObject();
			expect(
				await asyncActionCommits(
					actions.loadFormat,
					{storyFormatId: format.id},
					getters
				)
			).toEqual([]);
		});

		it('does nothing if the format is already loading', async () => {
			format.loading = true;
			expect(
				await asyncActionCommits(
					actions.loadFormat,
					{storyFormatId: format.id},
					getters
				)
			).toEqual([]);
		});

		it('does nothing if the format has previously failed to load', async () => {
			format.loadError = new Error('test error');
			expect(
				await asyncActionCommits(
					actions.loadFormat,
					{storyFormatId: format.id},
					getters
				)
			).toEqual([]);
		});

		it('always loads the format using a request if the force argument is true', async () => {
			format = fakeLoadedStoryFormatObject();
			await asyncActionCommits(
				actions.loadFormat,
				{force: true, storyFormatId: format.id},
				getters
			);
			expect(requestStoryFormat).toHaveBeenCalled();
			jest.resetAllMocks();
			Object.assign(format, {loadError: new Error(), loading: false});
			await asyncActionCommits(
				actions.loadFormat,
				{force: true, storyFormatId: format.id},
				getters
			);
			expect(requestStoryFormat).toHaveBeenCalled();
		});

		it('calls the setup property on the loaded data if it exists', async () => {
			const setup = jest.fn();

			requestStoryFormat.mockImplementation(url => {
				if (url === process.env.BASE_URL + format.url) {
					return {setup, source: 'mock format source'};
				}

				throw new Error(`Requested an unexpected URL: ${url}`);
			});
			await asyncActionCommits(
				actions.loadFormat,
				{storyFormatId: format.id},
				getters
			);
			expect(setup).toHaveBeenCalledTimes(1);
			expect(setup).toHaveBeenCalledWith();

			/* TODO: how to test it was bound to format? */
		});

		it('sets the loadError property of the format if the setup property throws', async () => {
			const loadError = new Error();
			const setup = () => {
				throw loadError;
			};

			requestStoryFormat.mockImplementation(url => {
				if (url === process.env.BASE_URL + format.url) {
					return {setup, source: 'mock format source'};
				}

				throw new Error(`Requested an unexpected URL: ${url}`);
			});

			expect(
				await asyncActionCommits(
					actions.loadFormat,
					{storyFormatId: format.id},
					getters
				)
			).toContainEqual([
				'updateFormat',
				{
					storyFormatId: format.id,
					storyFormatProps: expect.objectContaining({loadError})
				}
			]);
		});

		it('throws an error if there is no format with the ID in the store', async () =>
			expect(
				async () =>
					await asyncActionCommits(actions.loadFormat, {
						storyFormat: format.id + 'nonexistent'
					}).toThrow()
			));
	});

	describe('updateFormat()', () => {
		it('passes through an update mutation', () => {
			const payload = {
				storyFormatId: format.id,
				storyFormatProps: fakePendingStoryFormatObject()
			};

			expect(actionCommits(actions.updateFormat, payload, getters)).toEqual([
				['updateFormat', payload]
			]);
		});

		it('throws an error if there is no format with the ID in the store', () => {
			expect(() =>
				actionCommits(actions.updateFormat, {
					storyFormatId: format.id + 'nonexistent',
					storyFormatProps: {}
				})
			).toThrow();
		});
	});
});
