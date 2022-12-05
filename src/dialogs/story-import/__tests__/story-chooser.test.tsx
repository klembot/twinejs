import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Story} from '../../../store/stories';
import {fakeStory} from '../../../test-util';
import {StoryChooser, StoryChooserProps} from '../story-chooser';

describe('StoryChooser', () => {
	let stories: Story[];

	function renderComponent(props?: Partial<StoryChooserProps>) {
		return render(
			<StoryChooser
				existingStories={[]}
				onImport={jest.fn()}
				stories={[fakeStory()]}
				{...props}
			/>
		);
	}

	beforeEach(() => (stories = [fakeStory(), fakeStory(), fakeStory()]));

	it('renders a checkbox for every story in props', () => {
		renderComponent({stories});

		for (const story of stories) {
			expect(
				screen.getByRole('checkbox', {name: story.name})
			).toBeInTheDocument();
		}
	});

	it("checks the checkbox for stories that don't conflict with existing ones", () => {
		renderComponent({existingStories: [stories[0], stories[2]], stories});
		expect(
			screen.getByRole('checkbox', {name: stories[0].name})
		).not.toBeChecked();
		expect(screen.getByRole('checkbox', {name: stories[1].name})).toBeChecked();
		expect(
			screen.getByRole('checkbox', {name: stories[2].name})
		).not.toBeChecked();
	});

	it('enables the import button only if at least one story is selected', () => {
		renderComponent({stories, existingStories: stories});
		expect(
			screen.getByRole('button', {name: 'dialogs.storyImport.importSelected'})
		).toBeDisabled();
		expect(
			screen.getByRole('button', {name: 'dialogs.storyImport.importSelected'})
		).toBeDisabled();
		fireEvent.click(
			screen
				.getByRole('checkbox', {name: stories[0].name})
				.querySelector('button')!
		);
		expect(
			screen.getByRole('button', {name: 'dialogs.storyImport.importSelected'})
		).not.toBeDisabled();
	});

	it('calls onImport with checked stories when the import button is clicked', () => {
		const onImport = jest.fn();

		// Force all but the last checkbox to start unchecked.
		renderComponent({
			onImport,
			stories,
			existingStories: [stories[0], stories[1]]
		});
		fireEvent.click(
			screen
				.getByRole('checkbox', {name: stories[1].name})
				.querySelector('button')!
		);
		fireEvent.click(
			screen
				.getByRole('checkbox', {name: stories[2].name})
				.querySelector('button')!
		);
		expect(onImport).not.toHaveBeenCalled();
		fireEvent.click(
			screen.getByRole('button', {name: 'dialogs.storyImport.importSelected'})
		);
		expect(onImport.mock.calls).toEqual([[[stories[1]]]]);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
