import {fakeStoryFormatProperties} from '../../test-util/fakes';

export const fetchStoryFormatProperties = jest.fn(
	async (url: string, timeout = 2000) =>
		Promise.resolve(fakeStoryFormatProperties())
);
