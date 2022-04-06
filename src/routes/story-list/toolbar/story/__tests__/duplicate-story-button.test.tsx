import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../../../store/stories';
import {FakeStateProvider, StoryInspector} from '../../../../../test-util';
import {
	DuplicateStoryButton,
	DuplicateStoryButtonProps
} from '../duplicate-story-button';

const TestDuplicateStoryButton: React.FC<DuplicateStoryButtonProps> = props => {
	const {stories} = useStoriesContext();

	return (
		<>
			<DuplicateStoryButton story={stories[0]} {...props} />
			{stories.map(story => (
				<StoryInspector id={story.id} key={story.id} />
			))}
		</>
	);
};

function getStoryInspectors() {
	// Filtering is needed because there are other divs with test IDs starting
	// with `story-inspector`.

	return screen
		.getAllByTestId('story-inspector', {exact: false})
		.filter(el => el.dataset.id);
}

describe('<DuplicateStoryButton>', () => {
	function renderComponent(props?: Partial<DuplicateStoryButtonProps>) {
		return render(
			<FakeStateProvider>
				<TestDuplicateStoryButton {...props} />
			</FakeStateProvider>
		);
	}

	it('is disabled if no story is set', () => {
		renderComponent({story: undefined});
		expect(screen.getByText('common.duplicate')).toBeDisabled();
	});

	it('duplicates the story when clicked', () => {
		renderComponent();
		expect(getStoryInspectors().length).toBe(1);
		fireEvent.click(screen.getByText('common.duplicate'));
		expect(getStoryInspectors().length).toBe(2);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
