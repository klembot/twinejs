import {fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakeStory} from '../../../test-util';
import {StoryCard, StoryCardProps} from '../story-card';

jest.mock('../../tag/tag-button');
jest.mock('../../../util/is-electron');
jest.mock('../story-preview');

describe('<StoryCard>', () => {
	function renderComponent(props?: Partial<StoryCardProps>) {
		return render(
			<StoryCard
				onChangeTagColor={jest.fn()}
				onEdit={jest.fn()}
				onRemoveTag={jest.fn()}
				onSelect={jest.fn()}
				story={fakeStory()}
				storyTagColors={{}}
				{...props}
			/>
		);
	}

	it('renders the story name', () => {
		const story = fakeStory();

		renderComponent({story});
		expect(screen.getByText(story.name)).toBeInTheDocument();
	});

	it('renders a preview of the story', () => {
		const story = fakeStory();

		renderComponent({story});
		expect(
			screen.getByTestId(`mock-story-preview-${story.name}`)
		).toBeInTheDocument();
	});

	it('renders a count of passages in the story', () => {
		renderComponent();
		expect(
			screen.getByText('components.storyCard.passageCount', {exact: false})
		).toBeInTheDocument();
	});

	it("renders the story's last update", () => {
		renderComponent();
		expect(
			screen.getByText('components.storyCard.lastUpdated', {exact: false})
		).toBeInTheDocument();
	});

	it('renders a tag button for every tag the story has', () => {
		const story = fakeStory();

		story.tags = ['mock-tag-1', 'mock-tag-2'];

		renderComponent({story});
		expect(
			screen.getByTestId('mock-tag-button-mock-tag-1')
		).toBeInTheDocument();
		expect(
			screen.getByTestId('mock-tag-button-mock-tag-2')
		).toBeInTheDocument();
	});

	it('calls the onSelect prop when the card is clicked', () => {
		const story = fakeStory();
		const onSelect = jest.fn();

		renderComponent({story, onSelect});
		expect(onSelect).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText(story.name));
		expect(onSelect).toHaveBeenCalledTimes(1);
	});

	it('calls the onEdit prop when the card is double-clicked', () => {
		const story = fakeStory();
		const onEdit = jest.fn();

		renderComponent({story, onEdit});
		expect(onEdit).not.toHaveBeenCalled();
		fireEvent.dblClick(screen.getByText(story.name));
		expect(onEdit).toHaveBeenCalledTimes(1);
	});

	it('calls the onChangeTagColor prop when a tag color is edited', () => {
		const onChangeTagColor = jest.fn();
		const story = fakeStory();

		story.tags = ['mock-tag'];
		renderComponent({onChangeTagColor, story});
		expect(onChangeTagColor).not.toHaveBeenCalled();

		const tagButton = within(screen.getByTestId('mock-tag-button-mock-tag'));

		fireEvent.click(tagButton.getByText('onChangeColor'));
		expect(onChangeTagColor.mock.calls).toEqual([['mock-tag', 'mock-color']]);
	});

	it('calls the onRemoveTag prop when a tag is removed', () => {
		const onRemoveTag = jest.fn();
		const story = fakeStory();

		story.tags = ['mock-tag'];
		renderComponent({onRemoveTag, story});
		expect(onRemoveTag).not.toHaveBeenCalled();

		const tagButton = within(screen.getByTestId('mock-tag-button-mock-tag'));

		fireEvent.click(tagButton.getByText('onRemove'));
		expect(onRemoveTag.mock.calls).toEqual([['mock-tag']]);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
