import {render, waitFor} from '@testing-library/react';
import {createHashHistory} from 'history';
import * as React from 'react';
import {HashRouter, Route} from 'react-router-dom';
import {usePublishing} from '../../../store/use-publishing';
import {StoryTestRoute} from '../story-test-route';

jest.mock('../../../store/use-publishing');

describe('<StoryTestRoute>', () => {
	const usePublishingMock = usePublishing as jest.Mock;

	function renderComponent(route: string) {
		const history = createHashHistory();

		history.push(route);
		return render(
			<HashRouter>
				<Route path="/stories/:storyId/test" exact>
					<StoryTestRoute />
				</Route>
				<Route path="/stories/:storyId/test/:passageId" exact>
					<StoryTestRoute />
				</Route>
			</HashRouter>
		);
	}

	it('replaces the DOM with a testing version of the story in :storyId', async () => {
		const publishStory = jest.fn(
			jest.fn(() => Promise.resolve('mock-published-story'))
		);

		usePublishingMock.mockReturnValue({publishStory});
		renderComponent('/stories/123/test');
		await waitFor(() =>
			expect(document.body.textContent).toBe('mock-published-story')
		);
		expect(publishStory.mock.calls).toEqual([
			['123', {formatOptions: 'debug', startId: undefined}]
		]);
	});

	it('replaces the DOM with a testing version of the story in :storyId with a start passage specified by :passageId', async () => {
		const publishStory = jest.fn(
			jest.fn(() => Promise.resolve('mock-published-story'))
		);

		usePublishingMock.mockReturnValue({publishStory});
		renderComponent('/stories/123/test/456');
		await waitFor(() =>
			expect(document.body.textContent).toBe('mock-published-story')
		);
		expect(publishStory.mock.calls).toEqual([
			['123', {formatOptions: 'debug', startId: '456'}]
		]);
	});

	it('shows an error message if publishing fails', async () => {
		const publishStory = jest.fn(
			jest.fn(() => Promise.reject(new Error('mock-error-message')))
		);

		usePublishingMock.mockReturnValue({publishStory});
		renderComponent('/stories/123/test/456');
		await waitFor(() =>
			expect(document.body.textContent).toContain('mock-error-message')
		);
	});
});
