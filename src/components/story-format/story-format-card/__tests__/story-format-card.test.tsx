import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakeLoadedStoryFormat} from '../../../../test-util';
import {StoryFormatCard, StoryFormatCardProps} from '../story-format-card';

describe('<StoryFormatCard>', () => {
	function renderComponent(props?: Partial<StoryFormatCardProps>) {
		return render(
			<StoryFormatCard
				defaultFormat={false}
				editorExtensionsDisabled={false}
				format={fakeLoadedStoryFormat()}
				onSelect={jest.fn()}
				proofingFormat={false}
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

		it('calls the onSelect prop when the card is clicked', () => {
			const onSelect = jest.fn();

			renderComponent({onSelect});
			expect(onSelect).not.toHaveBeenCalled();
			fireEvent.click(screen.getByText('components.storyFormatCard.name'));
			expect(onSelect).toBeCalledTimes(1);
		});

		it("shows a badge if the format isn't user-added", () => {
			const format = fakeLoadedStoryFormat();

			format.userAdded = false;
			renderComponent({format});
			expect(
				screen.getByText('components.storyFormatCard.builtIn')
			).toBeInTheDocument();
		});

		it("doesn't show that badge if the format is user-added", () => {
			const format = fakeLoadedStoryFormat();

			format.userAdded = true;
			renderComponent({format});
			expect(
				screen.queryByText('components.storyFormatCard.builtIn')
			).not.toBeInTheDocument();
		});

		it('shows a badge if the format is the default format', () => {
			const format = fakeLoadedStoryFormat();

			renderComponent({format, defaultFormat: true});
			expect(
				screen.getByText('components.storyFormatCard.defaultFormat')
			).toBeInTheDocument();
		});

		it("doesn't show that badge if the format isn't the default format", () => {
			const format = fakeLoadedStoryFormat();

			renderComponent({format, defaultFormat: false});
			expect(
				screen.queryByText('components.storyFormatCard.defaultFormat')
			).not.toBeInTheDocument();
		});

		it('shows a badge if the format is a proofing format', () => {
			const format = fakeLoadedStoryFormat();

			(format as any).properties.proofing = true;
			renderComponent({format});
			expect(
				screen.getByText('components.storyFormatCard.proofing')
			).toBeInTheDocument();
		});

		it("doesn't show the same badge if the format is not proofing", () => {
			const format = fakeLoadedStoryFormat();

			(format as any).properties.proofing = false;
			renderComponent({format});
			expect(
				screen.queryByText('components.storyFormatCard.proofing')
			).not.toBeInTheDocument();
		});

		it('shows a badge if the format is the preferred proofing format', () => {
			const format = fakeLoadedStoryFormat();

			(format as any).properties.proofing = true;
			renderComponent({format, proofingFormat: true});
			expect(
				screen.getByText('components.storyFormatCard.proofingFormat')
			).toBeInTheDocument();
		});

		it("doesn't show the same badge if the format is not the preferred proofing format", () => {
			const format = fakeLoadedStoryFormat();

			(format as any).properties.proofing = true;
			renderComponent({format, proofingFormat: false});
			expect(
				screen.queryByText('components.storyFormatCard.proofingFormat')
			).not.toBeInTheDocument();
		});
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
