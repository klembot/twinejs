import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../../../store/stories';
import {
	fakeLoadedStoryFormat,
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory
} from '../../../../../test-util';
import {DetailsButton} from '../details-button';

const TestDetailsButton: React.FC = () => {
	const {stories} = useStoriesContext();

	return <DetailsButton story={stories[0]} />;
};

describe('<DetailsButton>', () => {
	function renderComponent(contexts?: FakeStateProviderProps) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestDetailsButton />
			</FakeStateProvider>
		);
	}

	it('opens the story details dialog when clicked', () => {
		const story = fakeStory();
		const format = fakeLoadedStoryFormat();

		story.storyFormat = format.name;
		story.storyFormatVersion = format.version;
		renderComponent({stories: [story], storyFormats: [format]});
		fireEvent.click(screen.getByText('common.details'));
		expect(screen.getByText(story.name)).toBeInTheDocument();
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
