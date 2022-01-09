import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakeLoadedStoryFormat} from '../../../../test-util';
import {StoryFormatCard, StoryFormatCardProps} from '../story-format-card';

describe('<StoryFormatCard>', () => {
	function renderComponent(props?: Partial<StoryFormatCardProps>) {
		return render(
			<StoryFormatCard
				format={fakeLoadedStoryFormat()}
				onSelect={jest.fn()}
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
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
