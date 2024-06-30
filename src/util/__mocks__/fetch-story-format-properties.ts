import {fakeStoryFormatProperties} from '../../test-util';

export const fetchStoryFormatProperties = jest.fn(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async (url: string, timeout = 2000) =>
		Promise.resolve(fakeStoryFormatProperties())
);
