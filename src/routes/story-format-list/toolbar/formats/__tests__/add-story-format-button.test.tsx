import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
	within
} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	fakeLoadedStoryFormat,
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStoryFormatProperties,
	StoryFormatInspector
} from '../../../../../test-util';
import {fetchStoryFormatProperties} from '../../../../../util/story-format';
import {AddStoryFormatButton} from '../add-story-format-button';

jest.mock('../../../../../util/story-format');

const getAddButton = () =>
	within(document.querySelector('.card-button-card')!).getByRole('button', {
		name: 'common.add'
	});

describe('<AddStoryFormatButton>', () => {
	const fetchStoryFormatPropertiesMock =
		fetchStoryFormatProperties as jest.Mock;

	beforeEach(() => {
		fetchStoryFormatPropertiesMock.mockReturnValue(fakeStoryFormatProperties());
	});

	async function renderComponent(contexts?: FakeStateProviderProps) {
		const result = render(
			<FakeStateProvider {...contexts}>
				<AddStoryFormatButton />
				<StoryFormatInspector />
			</FakeStateProvider>
		);

		// Need this because of <PromptButton>
		await act(async () => Promise.resolve());
		fireEvent.click(screen.getByText('common.add'));
		await act(async () => Promise.resolve());
		return result;
	}

	it('adds a format when a valid format URL is entered and the add button is clicked', async () => {
		const format = fakeLoadedStoryFormat();

		fetchStoryFormatPropertiesMock.mockResolvedValue(
			(format as any).properties
		);
		await renderComponent({storyFormats: []});
		expect(
			screen.queryByTestId('story-format-inspector-default')
		).not.toBeInTheDocument();
		fireEvent.change(
			screen.getByRole('textbox', {
				name: 'routes.storyFormatList.toolbar.addStoryFormatButton.prompt'
			}),
			{target: {value: 'http://mock-format-url'}}
		);
		await waitFor(() => Promise.resolve());
		fireEvent.click(getAddButton());

		const formatInspector = await screen.findByTestId(
			'story-format-inspector-default'
		);

		expect(formatInspector.dataset.name).toBe(format.name);
		expect(formatInspector.dataset.version).toBe(format.version);
	});

	it('shows an error if an invalid URL is entered', async () => {
		await renderComponent();
		fireEvent.change(
			screen.getByRole('textbox', {
				name: 'routes.storyFormatList.toolbar.addStoryFormatButton.prompt'
			}),
			{target: {value: 'not a url'}}
		);
		await act(async () => Promise.resolve());
		expect(
			screen.getByText(
				'routes.storyFormatList.toolbar.addStoryFormatButton.invalidUrl'
			)
		).toBeInTheDocument();
		expect(getAddButton()).toBeDisabled();
	});

	it('shows an error if fetching story properties fails', async () => {
		fetchStoryFormatPropertiesMock.mockRejectedValue(new Error());
		await renderComponent();
		fireEvent.change(
			screen.getByRole('textbox', {
				name: 'routes.storyFormatList.toolbar.addStoryFormatButton.prompt'
			}),
			{target: {value: 'http://mock-format-url'}}
		);
		await act(async () => Promise.resolve());
		expect(
			screen.getByText(
				'routes.storyFormatList.toolbar.addStoryFormatButton.fetchError'
			)
		).toBeInTheDocument();
		expect(getAddButton()).toBeDisabled();
	});

	it('shows an error if the URL points to a format with the same name and version as a format that already exists', async () => {
		const format = fakeLoadedStoryFormat();

		fetchStoryFormatPropertiesMock.mockResolvedValue(
			(format as any).properties
		);
		await renderComponent({storyFormats: [format]});
		fireEvent.change(
			screen.getByRole('textbox', {
				name: 'routes.storyFormatList.toolbar.addStoryFormatButton.prompt'
			}),
			{target: {value: 'http://mock-format-url'}}
		);
		await act(async () => Promise.resolve());
		expect(
			screen.getByText(
				'routes.storyFormatList.toolbar.addStoryFormatButton.alreadyAdded'
			)
		).toBeInTheDocument();
		expect(getAddButton()).toBeDisabled();
	});

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
