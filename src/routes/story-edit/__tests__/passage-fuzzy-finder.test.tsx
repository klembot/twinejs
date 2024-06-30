import {fireEvent, render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {FakeStateProvider, fakeStory, StoryInspector} from '../../../test-util';
import {
	PassageFuzzyFinder,
	PassageFuzzyFinderProps
} from '../passage-fuzzy-finder';

describe('PassageFuzzyFinder', () => {
	function renderComponent(
		props?: Partial<PassageFuzzyFinderProps>,
		story = fakeStory()
	) {
		return render(
			<FakeStateProvider stories={[story]}>
				<PassageFuzzyFinder
					onClose={jest.fn()}
					onOpen={jest.fn()}
					open
					setCenter={jest.fn()}
					story={story}
					{...props}
				/>
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	describe('When closed', () => {
		// Can't figure out how to trigger this in jsdom.

		it.todo('calls the onOpen prop when the P key is pressed');
	});

	describe('When open', () => {
		it('calls the onClose prop when the fuzzy finder is closed', () => {
			const onClose = jest.fn();

			renderComponent({onClose});
			expect(onClose).not.toBeCalled();
			fireEvent.click(screen.getByRole('button', {name: 'Close'}));
			expect(onClose).toBeCalledTimes(1);
		});

		it('updates results based on what the user enters', () => {
			const story = fakeStory(1);

			story.passages[0].name = 'a name';
			story.passages[0].text = 'text';
			renderComponent({}, story);
			fireEvent.change(screen.getByRole('textbox'), {target: {value: 'a'}});
			expect(
				screen.getByRole('button', {name: 'a name text'})
			).toBeInTheDocument();
		});

		describe('When a result is selected', () => {
			it('centers the view on a passage and selects it when a result is selected', () => {
				const setCenter = jest.fn();
				const story = fakeStory(1);

				story.passages[0].name = 'a name';
				story.passages[0].selected = false;
				story.passages[0].text = 'text';
				renderComponent({setCenter}, story);
				fireEvent.change(screen.getByRole('textbox'), {target: {value: 'a'}});
				expect(setCenter).not.toBeCalled();
				fireEvent.click(screen.getByRole('button', {name: 'a name text'}));
				expect(setCenter.mock.calls).toEqual([[story.passages[0]]]);
			});

			it('calls the onClose prop', () => {
				const onClose = jest.fn();
				const story = fakeStory(1);

				story.passages[0].name = 'a name';
				story.passages[0].selected = false;
				story.passages[0].text = 'text';
				renderComponent({onClose}, story);
				fireEvent.change(screen.getByRole('textbox'), {target: {value: 'a'}});
				expect(onClose).not.toBeCalled();
				fireEvent.click(screen.getByRole('button', {name: 'a name text'}));
				expect(onClose).toBeCalledTimes(1);
			});
		});
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
