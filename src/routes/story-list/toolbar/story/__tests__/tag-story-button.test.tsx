import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {useStoriesContext} from '../../../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	StoryInspector
} from '../../../../../test-util';
import {TagStoryButton, TagStoryButtonProps} from '../tag-story-button';

jest.mock('../../../../../components/tag/add-tag-button');

const TestTagStoryButton: React.FC<TagStoryButtonProps> = props => {
	const {stories} = useStoriesContext();

	return <TagStoryButton story={stories[0]} {...props} />;
};

describe('<TagStoryButton>', () => {
	function renderComponent(
		props?: Partial<TagStoryButtonProps>,
		contexts?: FakeStateProviderProps
	) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestTagStoryButton {...props} />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	it('is disabled if no story is set', () => {
		renderComponent({story: undefined});
		expect(screen.getByText('onAdd')).toBeDisabled();
	});

	it('adds a tag to the story', () => {
		renderComponent();
		expect(screen.getByTestId('story-inspector-default').dataset.tags).toBe('');
		fireEvent.click(screen.getByText('onAdd'));
		expect(screen.getByTestId('story-inspector-default').dataset.tags).toBe(
			'mock-tag-name'
		);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
