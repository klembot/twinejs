import {fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../../../../test-util';
import {
	DeselectAllPassagesButton,
	DeselectAllPassagesButtonProps
} from '../deselect-all-passages-button';

const TestDeselectAllPassagesButton: React.FC<
	Partial<DeselectAllPassagesButtonProps>
> = props => {
	const {stories} = useStoriesContext();

	return (
		<DeselectAllPassagesButton
			story={stories[0]}
			selectedPassages={[stories[0].passages[0]]}
			{...props}
		/>
	);
};

describe('<DeselectAllPassagesButton>', () => {
	function renderComponent(
		props?: Partial<DeselectAllPassagesButtonProps>,
		contexts?: FakeStateProviderProps
	) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestDeselectAllPassagesButton {...props} />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	it('is disabled if the selectedPassages prop is empty', () => {
		renderComponent({selectedPassages: []});
		expect(screen.getByText('common.deselectAll')).toBeDisabled();
	});

	it('deselects all passages in the story when clicked', () => {
		const story = fakeStory(3);

		story.passages[0].selected = true;
		story.passages[1].selected = true;
		story.passages[2].selected = true;
		renderComponent({story}, {stories: [story]});
		fireEvent.click(screen.getByText('common.deselectAll'));

		const passages = within(
			screen.getByTestId('story-inspector-default')
		).getAllByTestId(/passage-/);

		expect(passages.length).toBe(3);
		expect(
			passages.every(passage => passage.dataset.selected === 'false')
		).toBe(true);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
