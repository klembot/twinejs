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
	DeletePassagesButton,
	DeletePassagesButtonProps
} from '../delete-passages-button';

const TestDeletePassagesButton: React.FC<
	Partial<DeletePassagesButtonProps>
> = props => {
	const {stories} = useStoriesContext();

	return (
		<DeletePassagesButton
			passages={[stories[0].passages[0]]}
			story={stories[0]}
			{...props}
		/>
	);
};

describe('<DeletePassagesButton>', () => {
	function renderComponent(
		props?: Partial<DeletePassagesButtonProps>,
		contexts?: FakeStateProviderProps
	) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestDeletePassagesButton {...props} />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	it('is disabled if the passages prop is empty', () => {
		renderComponent({passages: []});
		expect(screen.getByText('common.delete')).toBeDisabled();
	});

	it('deletes passages when clicked', () => {
		const story = fakeStory(3);

		renderComponent(
			{story, passages: [story.passages[0], story.passages[1]]},
			{stories: [story]}
		);
		fireEvent.click(screen.getByText('common.deleteCount'));

		const passages = within(
			screen.getByTestId('story-inspector-default')
		).getAllByTestId(/passage-/);

		expect(passages.length).toBe(1);
		expect(passages[0].dataset.id).toBe(story.passages[2].id);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
