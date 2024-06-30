import {render, screen} from '@testing-library/react';
import * as React from 'react';
import {Story, useStoriesContext} from '../../../store/stories';
import {fakeStory, FakeStateProvider, StoryInspector} from '../../../test-util';
import {useInitialPassageCreation} from '../use-initial-passage-creation';

function TestComponent() {
	const {stories} = useStoriesContext();
	useInitialPassageCreation(stories[0], () => ({left: 20, top: 50}));
	return null;
}

describe('useInitialPassageCreation', () => {
	function renderHook(story: Story) {
		return render(
			<FakeStateProvider stories={[story]}>
				<TestComponent />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	it('creates a passage automatically if the story has none', () => {
		const story = fakeStory(0);

		renderHook(story);
		expect(screen.getByTestId('passage', {exact: false})).toBeInTheDocument();
		expect(screen.getAllByTestId('passage', {exact: false}).length).toBe(1);
	});

	it("doesn't create an additional passage if the story already has one", () => {
		const story = fakeStory(1);

		renderHook(story);
		expect(screen.getAllByTestId('passage', {exact: false}).length).toBe(1);
	});
});
