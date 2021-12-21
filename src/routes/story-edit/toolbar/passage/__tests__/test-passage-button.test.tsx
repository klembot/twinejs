import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory
} from '../../../../../test-util';
import {
	TestPassageButton,
	TestPassageButtonProps
} from '../test-passage-button';

const TestTestPassageButton: React.FC<
	Partial<TestPassageButtonProps>
> = props => {
	const {stories} = useStoriesContext();

	return <TestPassageButton story={stories[0]} {...props} />;
};

describe('<TestPassageButton>', () => {
	function renderComponent(
		props?: Partial<TestPassageButtonProps>,
		contexts?: FakeStateProviderProps
	) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestTestPassageButton {...props} />
			</FakeStateProvider>
		);
	}

	it('is disabled when the passage prop is undefined', () => {
		renderComponent({passage: undefined});
		expect(
			screen.getByText('routes.storyEdit.toolbar.testFromHere')
		).toBeDisabled();
	});

	it('tests the story from the passage when clicked', () => {
		const openSpy = jest.spyOn(window, 'open').mockReturnValue();
		const story = fakeStory();

		renderComponent({passage: story.passages[0]}, {stories: [story]});
		expect(openSpy).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('routes.storyEdit.toolbar.testFromHere'));
		expect(openSpy.mock.calls).toEqual([
			[`#/stories/${story.id}/test/${story.passages[0].id}`, '_blank']
		]);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
