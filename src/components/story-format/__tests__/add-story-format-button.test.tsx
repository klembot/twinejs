import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	AddStoryFormatButton,
	AddStoryFormatButtonProps
} from '../add-story-format-button';
import {fetchStoryFormatProperties} from '../../../util/story-format/fetch-properties';
import {
	fakeStoryFormatProperties,
	fakeLoadedStoryFormat
} from '../../../test-util';

jest.mock('../../../util/story-format/fetch-properties');

describe('<AddStoryFormatButton>', () => {
	const fetchStoryFormatPropertiesMock = fetchStoryFormatProperties as jest.Mock;

	beforeEach(() => {
		fetchStoryFormatPropertiesMock.mockReturnValue(fakeStoryFormatProperties());
	});

	async function renderComponent(props?: Partial<AddStoryFormatButtonProps>) {
		const result = render(
			<AddStoryFormatButton
				existingFormats={[]}
				onAddFormat={jest.fn()}
				{...props}
			/>
		);

		// Need this because of <PromptButton>
		await act(async () => Promise.resolve());
		fireEvent.click(screen.getByText('common.storyFormat'));
		await act(async () => Promise.resolve());
		return result;
	}

	it('calls the onAddFormat prop when a valid format URL is entered', async () => {
		const onAddFormat = jest.fn();
		const format = fakeLoadedStoryFormat();

		fetchStoryFormatPropertiesMock.mockResolvedValue(
			(format as any).properties
		);
		await renderComponent({onAddFormat});
		fireEvent.change(
			screen.getByLabelText('components.addStoryFormatButton.prompt'),
			{target: {value: 'http://mock-format-url'}}
		);
		await act(async () => Promise.resolve());
		expect(onAddFormat).not.toHaveBeenCalled();
		fireEvent.click(screen.getByText('common.add'));
		await waitFor(() => expect(onAddFormat).toHaveBeenCalled());
	});

	it('shows an error if an invalid URL is entered', async () => {
		await renderComponent();
		fireEvent.change(
			screen.getByLabelText('components.addStoryFormatButton.prompt'),
			{target: {value: 'not a url'}}
		);
		await act(async () => Promise.resolve());
		expect(
			screen.getByText('components.addStoryFormatButton.invalidUrl')
		).toBeInTheDocument();
		expect(screen.getByText('common.add')).toBeDisabled();
	});

	it('shows an error if fetching story properties fails', async () => {
		fetchStoryFormatPropertiesMock.mockRejectedValue(new Error());
		await renderComponent();
		fireEvent.change(
			screen.getByLabelText('components.addStoryFormatButton.prompt'),
			{target: {value: 'http://mock-format-url'}}
		);
		await act(async () => Promise.resolve());
		expect(
			screen.getByText('components.addStoryFormatButton.fetchError')
		).toBeInTheDocument();
		expect(screen.getByText('common.add')).toBeDisabled();
	});

	it('shows an error if the URL points to a format with the same name and version as a format that already exists', async () => {
		const format = fakeLoadedStoryFormat();

		fetchStoryFormatPropertiesMock.mockResolvedValue(
			(format as any).properties
		);
		await renderComponent({existingFormats: [format]});
		fireEvent.change(
			screen.getByLabelText('components.addStoryFormatButton.prompt'),
			{target: {value: 'http://mock-format-url'}}
		);
		await act(async () => Promise.resolve());
		expect(
			screen.getByText('components.addStoryFormatButton.alreadyAdded')
		).toBeInTheDocument();
		expect(screen.getByText('common.add')).toBeDisabled();
	});

	it('is accessible', async () => {
		const {container} = await renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
