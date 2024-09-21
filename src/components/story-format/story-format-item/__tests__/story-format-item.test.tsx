import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	fakeFailedStoryFormat,
	fakeLoadedStoryFormat,
	fakePendingStoryFormat
} from '../../../../test-util';
import {StoryFormatItem, StoryFormatItemProps} from '../story-format-item';

jest.mock('../story-format-item-details');

describe('<StoryFormatItem>', () => {
	function renderComponent(props?: Partial<StoryFormatItemProps>) {
		return render(
			<StoryFormatItem
				defaultFormat={false}
				editorExtensionsDisabled={false}
				format={fakeLoadedStoryFormat()}
				onChangeEditorExtensionsDisabled={jest.fn()}
				onDelete={jest.fn()}
				onUseAsDefault={jest.fn()}
				onUseAsProofing={jest.fn()}
				proofingFormat={false}
				{...props}
			/>
		);
	}

	it('shows a loading icon if the format is loading', () => {
		renderComponent({format: fakePendingStoryFormat()});
		expect(document.querySelector('.icon-loading')).toBeInTheDocument();
	});

	it('shows an error icon if the format failed to load', () => {
		renderComponent({format: fakeFailedStoryFormat()});
		expect(
			document.querySelector('.icon-tabler-alert-triangle')
		).toBeInTheDocument();
	});

	describe('when the format is loaded', () => {
		it('displays the format name and version', () => {
			renderComponent({format: fakeLoadedStoryFormat()});
			expect(
				screen.getByText('components.storyFormatItem.name')
			).toBeInTheDocument();
		});

		it("shows a badge if the format isn't user-added", () => {
			const format = fakeLoadedStoryFormat();

			format.userAdded = false;
			renderComponent({format});
			expect(
				screen.getByText('components.storyFormatItem.builtIn')
			).toBeInTheDocument();
		});

		it("doesn't show that badge if the format is user-added", () => {
			const format = fakeLoadedStoryFormat();

			format.userAdded = true;
			renderComponent({format});
			expect(
				screen.queryByText('components.storyFormatItem.builtIn')
			).not.toBeInTheDocument();
		});

		it('shows a badge if the format is the default format', () => {
			renderComponent({defaultFormat: true, format: fakeLoadedStoryFormat()});
			expect(
				screen.getByText('components.storyFormatItem.defaultFormat')
			).toBeInTheDocument();
		});

		it("doesn't show that badge if the format isn't the default format", () => {
			renderComponent({defaultFormat: false, format: fakeLoadedStoryFormat()});
			expect(
				screen.queryByText('components.storyFormatItem.defaultFormat')
			).not.toBeInTheDocument();
		});

		it('shows a badge if the format is a proofing format', () => {
			const format = fakeLoadedStoryFormat();

			(format as any).properties.proofing = true;
			renderComponent({format});
			expect(
				screen.getByText('components.storyFormatItem.proofing')
			).toBeInTheDocument();
		});

		it("doesn't show the same badge if the format is not proofing", () => {
			const format = fakeLoadedStoryFormat();

			(format as any).properties.proofing = false;
			renderComponent({format});
			expect(
				screen.queryByText('components.storyFormatItem.proofing')
			).not.toBeInTheDocument();
		});

		it('shows a badge if the format is the preferred proofing format', () => {
			const format = fakeLoadedStoryFormat();

			(format as any).properties.proofing = true;
			renderComponent({format, proofingFormat: true});
			expect(
				screen.getByText('components.storyFormatItem.proofingFormat')
			).toBeInTheDocument();
		});

		it("doesn't show the same badge if the format is not the preferred proofing format", () => {
			const format = fakeLoadedStoryFormat();

			(format as any).properties.proofing = true;
			renderComponent({format, proofingFormat: false});
			expect(
				screen.queryByText('components.storyFormatItem.proofingFormat')
			).not.toBeInTheDocument();
		});

		it('highlights itself if the format is the preferred proofing format', () => {
			const format = fakeLoadedStoryFormat();

			(format as any).properties.proofing = true;
			renderComponent({format, proofingFormat: true});
			expect(document.querySelector('.story-format-item')).toHaveClass(
				'highlighted'
			);
		});

		it('highlights itself if the format is the default format', () => {
			const format = fakeLoadedStoryFormat();

			(format as any).properties.proofing = false;
			renderComponent({format, defaultFormat: true});
			expect(document.querySelector('.story-format-item')).toHaveClass(
				'highlighted'
			);
		});

		it("doesn't highlight itself if the format is neither the proofing or default format", () => {
			renderComponent({format: fakeLoadedStoryFormat()});
			expect(document.querySelector('.story-format-item')).not.toHaveClass(
				'highlighted'
			);
		});

		it('shows format details', () => {
			renderComponent({format: fakeLoadedStoryFormat()});
			expect(
				screen.getByTestId('mock-story-format-item-details')
			).toBeInTheDocument();
		});

		it('shows a button that calls the onDelete prop if the format is user-added', () => {
			const onDelete = jest.fn();

			renderComponent({
				onDelete,
				format: fakeLoadedStoryFormat({userAdded: true})
			});
			expect(onDelete).not.toHaveBeenCalled();
			fireEvent.click(screen.getByRole('button', {name: 'common.delete'}));
			expect(onDelete).toHaveBeenCalledTimes(1);
		});

		it("doesn't show that button if the format isn't user-added", () => {
			renderComponent({format: fakeLoadedStoryFormat({userAdded: false})});
			expect(
				screen.queryByRole('button', {name: 'common.delete'})
			).not.toBeInTheDocument();
		});

		describe('When editor extensions for the format are enabled', () => {
			it('shows a checked checkbox', () => {
				renderComponent({
					editorExtensionsDisabled: false,
					format: fakeLoadedStoryFormat()
				});
				expect(
					screen.getByRole('checkbox', {
						name: 'components.storyFormatItem.useEditorExtensions'
					})
				).toBeChecked();
			});

			it('calls the onChangeEditorExtensionsEnabled prop when clicked', () => {
				const onChangeEditorExtensionsDisabled = jest.fn();

				renderComponent({
					onChangeEditorExtensionsDisabled,
					editorExtensionsDisabled: false,
					format: fakeLoadedStoryFormat()
				});
				expect(onChangeEditorExtensionsDisabled).not.toHaveBeenCalled();
				fireEvent.click(
					screen.getByRole('checkbox', {
						name: 'components.storyFormatItem.useEditorExtensions'
					})
				);
				expect(onChangeEditorExtensionsDisabled.mock.calls).toEqual([[true]]);
			});
		});

		describe('When editor extensions for the format are disabled', () => {
			it('shows an unchecked checkbox', () => {
				renderComponent({
					editorExtensionsDisabled: true,
					format: fakeLoadedStoryFormat()
				});
				expect(
					screen.getByRole('checkbox', {
						name: 'components.storyFormatItem.useEditorExtensions'
					})
				).not.toBeChecked();
			});

			it('calls the onChangeEditorExtensionsEnabled prop when clicked', () => {
				const onChangeEditorExtensionsDisabled = jest.fn();

				renderComponent({
					onChangeEditorExtensionsDisabled,
					editorExtensionsDisabled: true,
					format: fakeLoadedStoryFormat()
				});
				expect(onChangeEditorExtensionsDisabled).not.toHaveBeenCalled();
				fireEvent.click(
					screen.getByRole('checkbox', {
						name: 'components.storyFormatItem.useEditorExtensions'
					})
				);
				expect(onChangeEditorExtensionsDisabled.mock.calls).toEqual([[false]]);
			});
		});
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
