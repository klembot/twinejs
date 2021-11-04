import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {StoryFormat} from '../../../../store/story-formats';
import {fakeLoadedStoryFormat} from '../../../../test-util';
import {StoryFormatCard, StoryFormatCardProps} from '../story-format-card';

describe('<StoryFormatCard>', () => {
	function renderComponent(props?: Partial<StoryFormatCardProps>) {
		return render(
			<StoryFormatCard
				useEditorExtensions
				format={fakeLoadedStoryFormat()}
				onChangeUseEditorExtensions={jest.fn()}
				onDelete={jest.fn()}
				onSelect={jest.fn()}
				selected
				{...props}
			/>
		);
	}

	it.todo('shows a loading icon if the format is loading');
	it.todo('shows an error icon if the format failed to load');

	describe('when the format is loaded', () => {
		it('displays the format name and version', () => {
			const format = fakeLoadedStoryFormat();

			renderComponent({format});
			expect(
				screen.getByText('components.storyFormatCard.name')
			).toBeInTheDocument();
		});

		it('shows a disabled, selected checkbox button when the format is selected', () => {
			const format = fakeLoadedStoryFormat();

			renderComponent({format, selected: true});

			const checkbox = screen.getByRole('checkbox', {
				name: 'components.storyFormatCard.useFormat'
			});

			expect(checkbox).toBeChecked();
			expect(checkbox.querySelector('button')).toBeDisabled();
		});

		it('shows a nonselected checkbox button when the format is not selected', () => {
			const format = fakeLoadedStoryFormat();

			renderComponent({format, selected: false});
			expect(
				screen.getByRole('checkbox', {
					name: 'components.storyFormatCard.useFormat'
				})
			).not.toBeChecked();
		});

		it('calls the onSelect prop when the checkbox button is clicked', () => {
			const onSelect = jest.fn();

			renderComponent({onSelect, selected: false});
			expect(onSelect).not.toHaveBeenCalled();
			fireEvent.click(screen.getByText('components.storyFormatCard.useFormat'));
			expect(onSelect.mock.calls).toEqual([[true]]);
		});

		it('shows a checkbox button to control editor extensions if the format is not proofing', () => {
			const format = fakeLoadedStoryFormat();

			(format as any).properties.proofing = false;
			renderComponent({format});
			expect(
				screen.getByText('components.storyFormatCard.useEditorExtensions')
			).toBeInTheDocument();
		});

		it('calls onChangeUseEditorExtensions when the editor extensions checkbox is selected', () => {
			const format = fakeLoadedStoryFormat();
			const onChangeUseEditorExtensions = jest.fn();

			(format as any).properties.proofing = false;
			renderComponent({format, onChangeUseEditorExtensions});
			expect(onChangeUseEditorExtensions).not.toHaveBeenCalled();
			fireEvent.click(
				screen.getByText('components.storyFormatCard.useEditorExtensions')
			);
			expect(onChangeUseEditorExtensions).toBeCalledTimes(1);
		});

		it("doesn't show a checkbox button to control editor extensions if the format is proofing", () => {
			const format = fakeLoadedStoryFormat();

			(format as any).properties.proofing = true;
			renderComponent({format});
			expect(
				screen.queryByText('components.storyFormatCard.useEditorExtensions')
			).not.toBeInTheDocument();
		});

		it('shows a button to delete the format if it is user-added', () => {
			const format = fakeLoadedStoryFormat({userAdded: true});

			renderComponent({format});
			expect(screen.getByText('common.delete')).toBeInTheDocument();
		});

		it('calls the onDelete prop when the delete button is clicked', () => {
			const format = fakeLoadedStoryFormat({userAdded: true});
			const onDelete = jest.fn();

			renderComponent({format, onDelete});
			expect(onDelete).not.toHaveBeenCalled();
			fireEvent.click(screen.getByText('common.delete'));
			expect(onDelete).toHaveBeenCalledTimes(1);
		});

		it("doesn't show a button to delete the format if it is user-added", () => {
			const format = fakeLoadedStoryFormat({userAdded: false});

			renderComponent({format});
			expect(screen.queryByText('common.delete')).not.toBeInTheDocument();
		});
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
