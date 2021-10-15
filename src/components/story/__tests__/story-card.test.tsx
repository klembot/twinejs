import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakeStory} from '../../../test-util';
import {StoryCard, StoryCardProps} from '../story-card';

jest.mock('../../control/menu-button');
jest.mock('../../tag/add-tag-button');
jest.mock('../../tag/tag-button');
jest.mock('../story-preview');

describe('<StoryCard>', () => {
	async function renderComponent(props?: Partial<StoryCardProps>) {
		const story = fakeStory();
		const result = render(
			<StoryCard
				allStories={[story]}
				onAddTag={jest.fn()}
				onChangeTagColor={jest.fn()}
				onDelete={jest.fn()}
				onDuplicate={jest.fn()}
				onEdit={jest.fn()}
				onPlay={jest.fn()}
				onPublish={jest.fn()}
				onRemoveTag={jest.fn()}
				onRename={jest.fn()}
				onTest={jest.fn()}
				story={story}
				storyTagColors={{}}
				{...props}
			/>
		);

		// Need this because of <PromptButton>
		await act(() => Promise.resolve());
		return result;
	}

	it('renders the story name', async () => {
		const story = fakeStory();

		await renderComponent({story, allStories: [story]});
		expect(screen.getByText(story.name)).toBeInTheDocument();
	});

	it('renders a preview of the story', async () => {
		const story = fakeStory();

		await renderComponent({story, allStories: [story]});
		expect(
			screen.getByTestId(`mock-story-preview-${story.name}`)
		).toBeInTheDocument();
	});

	it('renders a count of passages in the story', async () => {
		await renderComponent();
		expect(
			screen.getByText('components.storyCard.passageCount', {exact: false})
		).toBeInTheDocument();
	});

	it("renders the story's last update", async () => {
		await renderComponent();
		expect(
			screen.getByText('components.storyCard.lastUpdated', {exact: false})
		).toBeInTheDocument();
	});

	it('renders a tag button for every tag the story has', async () => {
		const story = fakeStory();

		story.tags = ['mock-tag-1', 'mock-tag-2'];

		await renderComponent({story, allStories: [story]});
		expect(
			screen.getByTestId('mock-tag-button-mock-tag-1')
		).toBeInTheDocument();
		expect(
			screen.getByTestId('mock-tag-button-mock-tag-2')
		).toBeInTheDocument();
	});

	it('calls the onDelete prop when the delete button is clicked', async () => {
		const onDelete = jest.fn();

		await renderComponent({onDelete});
		expect(onDelete).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.delete'));
		expect(onDelete).toHaveBeenCalledTimes(1);
	});

	it('calls the onDuplicate prop when the duplicate button is clicked', async () => {
		const onDuplicate = jest.fn();

		await renderComponent({onDuplicate});
		expect(onDuplicate).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.duplicate'));
		expect(onDuplicate).toHaveBeenCalledTimes(1);
	});

	it('calls the onEdit prop when the edit button is clicked', async () => {
		const onEdit = jest.fn();

		await renderComponent({onEdit});
		expect(onEdit).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.edit'));
		expect(onEdit).toHaveBeenCalledTimes(1);
	});

	it('calls the onPlay prop when the play button is clicked', async () => {
		const onPlay = jest.fn();

		await renderComponent({onPlay});
		expect(onPlay).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.play'));
		expect(onPlay).toHaveBeenCalledTimes(1);
	});

	it('calls the onPublish prop when the publish button is clicked', async () => {
		const onPublish = jest.fn();

		await renderComponent({onPublish});
		expect(onPublish).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.publishToFile'));
		expect(onPublish).toHaveBeenCalledTimes(1);
	});

	it('calls the onTest prop when the test button is clicked', async () => {
		const onTest = jest.fn();

		await renderComponent({onTest});
		expect(onTest).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.test'));
		expect(onTest).toHaveBeenCalledTimes(1);
	});

	it('calls the onAddTag prop when a tag is added', async () => {
		const onAddTag = jest.fn();

		await renderComponent({onAddTag});
		expect(onAddTag).not.toHaveBeenCalled();
		fireEvent.click(
			within(screen.getByTestId('mock-add-tag-button')).getByText('onAdd')
		);
		expect(onAddTag.mock.calls).toEqual([['mock-tag-name', 'mock-color']]);
	});

	it('calls the onChangeTagColor prop when a tag color is edited', async () => {
		const onChangeTagColor = jest.fn();
		const story = fakeStory();

		story.tags = ['mock-tag'];
		await renderComponent({onChangeTagColor, story, allStories: [story]});
		expect(onChangeTagColor).not.toHaveBeenCalled();

		const tagButton = within(screen.getByTestId('mock-tag-button-mock-tag'));

		fireEvent.click(tagButton.getByText('onChangeColor'));
		expect(onChangeTagColor.mock.calls).toEqual([['mock-tag', 'mock-color']]);
	});

	it('calls the onRemoveTag prop when a tag is removed', async () => {
		const onRemoveTag = jest.fn();
		const story = fakeStory();

		story.tags = ['mock-tag'];
		await renderComponent({onRemoveTag, story, allStories: [story]});
		expect(onRemoveTag).not.toHaveBeenCalled();

		const tagButton = within(screen.getByTestId('mock-tag-button-mock-tag'));

		fireEvent.click(tagButton.getByText('onRemove'));
		expect(onRemoveTag.mock.calls).toEqual([['mock-tag']]);
	});

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
