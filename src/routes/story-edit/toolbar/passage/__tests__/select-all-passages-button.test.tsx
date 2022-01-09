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
	SelectAllPassagesButton,
	SelectAllPassagesButtonProps
} from '../select-all-passages-button';

const TestSelectAllPassagesButton: React.FC<
	Partial<SelectAllPassagesButtonProps>
> = props => {
	const {stories} = useStoriesContext();

	return <SelectAllPassagesButton story={stories[0]} {...props} />;
};

describe('<SelectAllPassagesButton>', () => {
	function renderComponent(
		props?: Partial<SelectAllPassagesButtonProps>,
		contexts?: FakeStateProviderProps
	) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestSelectAllPassagesButton {...props} />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	it('selects all passages in the story when clicked', () => {
		const story = fakeStory(3);

		story.passages[0].selected = true;
		story.passages[1].selected = false;
		story.passages[2].selected = false;
		renderComponent({story}, {stories: [story]});
		fireEvent.click(screen.getByText('common.selectAll'));

		const passages = within(
			screen.getByTestId('story-inspector-default')
		).getAllByTestId(/passage-/);

		expect(passages.length).toBe(3);
		expect(passages.every(passage => passage.dataset.selected === 'true')).toBe(
			true
		);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
