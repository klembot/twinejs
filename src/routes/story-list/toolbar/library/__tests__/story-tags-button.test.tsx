import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {FakeStateProvider} from '../../../../../test-util';
import {StoryTagsButton} from '../story-tags-button';

describe('<StoryTagsButton>', () => {
	function renderComponent() {
		return render(
			<FakeStateProvider>
				<StoryTagsButton />
			</FakeStateProvider>
		);
	}

	it('opens a story tags dialog when clicked', () => {
		renderComponent();
		expect(
			screen.queryByText('dialogs.storyTags.title')
		).not.toBeInTheDocument();
		fireEvent.click(screen.getByText('routes.storyList.toolbar.storyTags'));
		expect(screen.getByText('dialogs.storyTags.title')).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
