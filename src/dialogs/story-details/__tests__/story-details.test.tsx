import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within
} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	fakeLoadedStoryFormat,
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../../test-util';
import {StoryDetailsDialog, StoryDetailsDialogProps} from '../story-details';

jest.mock('../story-stats');

describe('<StoryDetailsDialog>', () => {
	async function renderComponent(
		props?: Partial<StoryDetailsDialogProps>,
		contexts?: FakeStateProviderProps
	) {
		const story = fakeStory();
		const format = fakeLoadedStoryFormat({
			name: story.storyFormat,
			version: story.storyFormatVersion
		});

		const result = render(
			<FakeStateProvider
				stories={[story]}
				storyFormats={[format]}
				{...contexts}
			>
				<StoryDetailsDialog
					collapsed={false}
					onChangeCollapsed={jest.fn()}
					onChangeHighlighted={jest.fn()}
					onChangeMaximized={jest.fn()}
					onClose={jest.fn()}
					storyId={story.id}
					{...props}
				/>
				<StoryInspector />
			</FakeStateProvider>
		);

		// Need this because of <PromptButton>
		await act(async () => Promise.resolve());
		return result;
	}

	it('displays stats for the story if the dialog is expanded', async () => {
		const story = fakeStory();
		const format = fakeLoadedStoryFormat({
			name: story.storyFormat,
			version: story.storyFormatVersion
		});

		await renderComponent(
			{collapsed: false, storyId: story.id},
			{stories: [story], storyFormats: [format]}
		);
		expect(
			screen.getByTestId(`mock-story-details-dialog-stats-${story.id}`)
		).toBeInTheDocument();
	});

	it("doesn't display stats for the story if the dialog is expanded", async () => {
		const story = fakeStory();
		const format = fakeLoadedStoryFormat({
			name: story.storyFormat,
			version: story.storyFormatVersion
		});

		await renderComponent(
			{collapsed: true, storyId: story.id},
			{stories: [story], storyFormats: [format]}
		);
		expect(
			screen.queryByTestId(`mock-story-details-dialog-stats-${story.id}`)
		).not.toBeInTheDocument();
	});

	it('displays a checkbox button reflecting whether snap to grid is turned on for the story', async () => {
		const story = fakeStory();
		const format = fakeLoadedStoryFormat({
			name: story.storyFormat,
			version: story.storyFormatVersion
		});

		story.snapToGrid = true;
		await renderComponent(
			{storyId: story.id},
			{stories: [story], storyFormats: [format]}
		);
		expect(
			screen.getByText('dialogs.storyDetails.snapToGrid').parentNode
		).toBeChecked();
		cleanup();
		story.snapToGrid = false;
		await renderComponent(
			{storyId: story.id},
			{stories: [story], storyFormats: [format]}
		);
		expect(
			screen.getByText('dialogs.storyDetails.snapToGrid').parentNode
		).not.toBeChecked();
	});

	it('changes the story when the snap to grid button is checked', async () => {
		const story = fakeStory();
		const format = fakeLoadedStoryFormat({
			name: story.storyFormat,
			version: story.storyFormatVersion
		});

		story.snapToGrid = true;
		await renderComponent(
			{storyId: story.id},
			{stories: [story], storyFormats: [format]}
		);
		expect(
			screen.getByTestId('story-inspector-default').dataset.snapToGrid
		).toBe('true');
		fireEvent.click(screen.getByText('dialogs.storyDetails.snapToGrid'));
		expect(
			screen.getByTestId('story-inspector-default').dataset.snapToGrid
		).toBe('false');
	});

	it("displays a dropdown of story formats with the story's format selected", async () => {
		const story = fakeStory();
		const format = fakeLoadedStoryFormat({
			name: story.storyFormat,
			version: story.storyFormatVersion
		});
		const format2 = fakeLoadedStoryFormat();

		await renderComponent(
			{storyId: story.id},
			{stories: [story], storyFormats: [format, format2]}
		);

		const select = screen.getByLabelText('common.storyFormat');

		expect(select).toHaveValue(format.id);

		const options = within(select).queryAllByRole('option');

		expect(options.length).toBe(2);
		expect(
			options.find(o => o.textContent === `${format.name} ${format.version}`)
		).toHaveAttribute('value', format.id);
		expect(
			options.find(o => o.textContent === `${format2.name} ${format2.version}`)
		).toHaveAttribute('value', format2.id);
	});

	it('changes the story when another format is chosen', async () => {
		const story = fakeStory();
		const format = fakeLoadedStoryFormat({
			name: story.storyFormat,
			version: story.storyFormatVersion
		});
		const format2 = fakeLoadedStoryFormat();

		await renderComponent(
			{storyId: story.id},
			{stories: [story], storyFormats: [format, format2]}
		);
		expect(
			screen.getByTestId('story-inspector-default').dataset.storyFormat
		).toBe(format.name);
		expect(
			screen.getByTestId('story-inspector-default').dataset.storyFormatVersion
		).toBe(format.version);
		fireEvent.change(screen.getByLabelText('common.storyFormat'), {
			target: {value: format2.id}
		});
		expect(
			screen.getByTestId('story-inspector-default').dataset.storyFormat
		).toBe(format2.name);
		expect(
			screen.getByTestId('story-inspector-default').dataset.storyFormatVersion
		).toBe(format2.version);
	});

	it('displays a link explaining what a story format is', async () => {
		await renderComponent();
		expect(screen.getByRole('link')).toHaveAttribute(
			'href',
			'https://twinery.org/2storyformats'
		);
	});

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
