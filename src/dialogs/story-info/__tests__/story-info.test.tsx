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
import {StoriesContext, StoriesContextProps} from '../../../store/stories';
import {
	StoryFormatsContext,
	StoryFormatsContextProps
} from '../../../store/story-formats';
import {fakeLoadedStoryFormat, fakeStory} from '../../../test-util';
import {StoryInfoDialog, StoryInfoDialogProps} from '../story-info';

jest.mock('../../../components/story/rename-story-button');
jest.mock('../story-stats');

describe('<StoryInfoDialog>', () => {
	async function renderComponent(
		props?: Partial<StoryInfoDialogProps>,
		storiesContext?: Partial<StoriesContextProps>,
		storyFormatsContext?: Partial<StoryFormatsContextProps>
	) {
		const story = fakeStory();
		const format = fakeLoadedStoryFormat({
			name: story.storyFormat,
			version: story.storyFormatVersion
		});

		const result = render(
			<StoryFormatsContext.Provider
				value={{dispatch: jest.fn(), formats: [format], ...storyFormatsContext}}
			>
				<StoriesContext.Provider
					value={{dispatch: jest.fn(), stories: [story], ...storiesContext}}
				>
					<StoryInfoDialog
						collapsed={false}
						onChangeCollapsed={jest.fn()}
						onClose={jest.fn()}
						storyId={story.id}
						{...props}
					/>
				</StoriesContext.Provider>
			</StoryFormatsContext.Provider>
		);

		// Need this because of <PromptButton>
		await act(async () => Promise.resolve());
		return result;
	}

	it('displays a button to rename the story', async () => {
		const story = fakeStory();
		const format = fakeLoadedStoryFormat({
			name: story.storyFormat,
			version: story.storyFormatVersion
		});

		await renderComponent(
			{storyId: story.id},
			{stories: [story]},
			{formats: [format]}
		);
		expect(
			screen.getByText(`mock-rename-story-button-${story.id}`)
		).toBeInTheDocument();
	});

	it('dispatches a story update when the story is renamed', async () => {
		const dispatch = jest.fn();
		const story = fakeStory();
		const format = fakeLoadedStoryFormat({
			name: story.storyFormat,
			version: story.storyFormatVersion
		});

		await renderComponent(
			{storyId: story.id},
			{dispatch, stories: [story]},
			{formats: [format]}
		);
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText(`mock-rename-story-button-${story.id}`));

		// See the mock for <RenameStoryButton>.

		expect(dispatch.mock.calls).toEqual([
			[{type: 'updateStory', storyId: story.id, props: {name: 'mock-new-name'}}]
		]);
	});

	it('displays stats for the story if the dialog is expanded', async () => {
		const story = fakeStory();
		const format = fakeLoadedStoryFormat({
			name: story.storyFormat,
			version: story.storyFormatVersion
		});

		await renderComponent(
			{collapsed: false, storyId: story.id},
			{stories: [story]},
			{formats: [format]}
		);
		expect(
			screen.getByTestId(`mock-story-info-dialog-stats-${story.id}`)
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
			{stories: [story]},
			{formats: [format]}
		);
		expect(
			screen.queryByTestId(`mock-story-info-dialog-stats-${story.id}`)
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
			{stories: [story]},
			{formats: [format]}
		);
		expect(
			screen.getByText('dialogs.storyInfo.snapToGrid').parentNode
		).toBeChecked();
		cleanup();
		story.snapToGrid = false;
		await renderComponent(
			{storyId: story.id},
			{stories: [story]},
			{formats: [format]}
		);
		expect(
			screen.getByText('dialogs.storyInfo.snapToGrid').parentNode
		).not.toBeChecked();
	});

	it('dispatches a story update when the snap to grid button is checked', async () => {
		const dispatch = jest.fn();
		const story = fakeStory();
		const format = fakeLoadedStoryFormat({
			name: story.storyFormat,
			version: story.storyFormatVersion
		});

		story.snapToGrid = true;
		await renderComponent(
			{storyId: story.id},
			{dispatch, stories: [story]},
			{formats: [format]}
		);
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('dialogs.storyInfo.snapToGrid'));
		expect(dispatch.mock.calls).toEqual([
			[{type: 'updateStory', storyId: story.id, props: {snapToGrid: false}}]
		]);
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
			{stories: [story]},
			{formats: [format, format2]}
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

	it('dispatches a story update when another format is chosen', async () => {
		const dispatch = jest.fn();
		const story = fakeStory();
		const format = fakeLoadedStoryFormat({
			name: story.storyFormat,
			version: story.storyFormatVersion
		});
		const format2 = fakeLoadedStoryFormat();

		await renderComponent(
			{storyId: story.id},
			{dispatch, stories: [story]},
			{formats: [format, format2]}
		);
		expect(dispatch).not.toHaveBeenCalled();
		fireEvent.change(screen.getByLabelText('common.storyFormat'), {
			target: {value: format2.id}
		});
		expect(dispatch.mock.calls).toEqual([
			[
				{
					type: 'updateStory',
					storyId: story.id,
					props: {
						storyFormat: format2.name,
						storyFormatVersion: format2.version
					}
				}
			]
		]);
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
