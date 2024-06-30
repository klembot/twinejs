import {fireEvent, render, screen, within} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {Story, useStoriesContext} from '../../../../../store/stories';
import {
	FakeStateProvider,
	FakeStateProviderProps,
	fakeStory,
	StoryInspector
} from '../../../../../test-util';
import {
	DeletePassagesButton,
	DeletePassagesButtonProps
} from '../delete-passages-button';

const TestDeletePassagesButton: React.FC<
	Partial<DeletePassagesButtonProps>
> = props => {
	const {stories} = useStoriesContext();

	return (
		<>
			<DeletePassagesButton
				passages={[stories[0].passages[0]]}
				story={stories[0]}
				{...props}
			/>
			<input aria-hidden type="text" />
			<textarea aria-hidden></textarea>
		</>
	);
};

describe('<DeletePassagesButton>', () => {
	function renderComponent(
		props?: Partial<DeletePassagesButtonProps>,
		contexts?: FakeStateProviderProps
	) {
		return render(
			<FakeStateProvider {...contexts}>
				<TestDeletePassagesButton {...props} />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	it('is disabled if the passages prop is empty', () => {
		renderComponent({passages: []});
		expect(screen.getByText('common.delete')).toBeDisabled();
	});

	it('is disabled if any of the passages are the start passage', () => {
		const story = fakeStory(2);

		story.startPassage = story.passages[1].id;
		renderComponent({story, passages: story.passages});
		expect(screen.getByText('common.delete')).toBeDisabled();
	});

	it('deletes passages when clicked', () => {
		const story = fakeStory(3);

		story.startPassage = story.passages[2].id;
		renderComponent(
			{story, passages: [story.passages[0], story.passages[1]]},
			{stories: [story]}
		);
		fireEvent.click(screen.getByText('common.deleteCount'));

		const passages = within(
			screen.getByTestId('story-inspector-default')
		).getAllByTestId(/passage-/);

		expect(passages.length).toBe(1);
		expect(passages[0].dataset.id).toBe(story.passages[2].id);
	});

	// To a degree, this is actually testing react-hotkeys-hook. But it makes
	// sense to test this behavior since deleting passages is scary.

	describe('when a text input is not focused', () => {
		let story: Story;

		beforeEach(() => {
			story = fakeStory(1);

			renderComponent(
				{story, passages: [story.passages[0]]},
				{stories: [story]}
			);
		});

		it('deletes passages when the Delete key is pressed', () => {
			fireEvent.keyDown(document.body, {
				key: 'Delete',
				code: 'Delete',
				keyCode: 46,
				charCode: 46
			});
			expect(
				within(screen.getByTestId('story-inspector-default')).queryAllByTestId(
					/passage-/
				).length
			).toBe(0);
		});

		it('deletes passages when the Backspace key is pressed', () => {
			fireEvent.keyDown(document.body, {
				key: 'Backspace',
				code: 'Backspace',
				keyCode: 8,
				charCode: 8
			});
			expect(
				within(screen.getByTestId('story-inspector-default')).queryAllByTestId(
					/passage-/
				).length
			).toBe(0);
		});
	});

	describe('when a text field is focused', () => {
		let story: Story;

		beforeEach(() => {
			story = fakeStory(1);

			renderComponent(
				{story, passages: [story.passages[0]]},
				{stories: [story]}
			);
		});

		it("doesn't delete passages when the Delete key is pressed", () => {
			fireEvent.keyDown(document.querySelector('input[type="text"]')!, {
				key: 'Delete',
				code: 'Delete',
				keyCode: 46,
				charCode: 46
			});
			expect(
				within(screen.getByTestId('story-inspector-default')).queryAllByTestId(
					/passage-/
				).length
			).toBe(1);
		});

		it("doesn't delete passages when the Backspace key is pressed", () => {
			fireEvent.keyDown(document.querySelector('input[type="text"]')!, {
				key: 'Backspace',
				code: 'Backspace',
				keyCode: 8,
				charCode: 8
			});
			expect(
				within(screen.getByTestId('story-inspector-default')).queryAllByTestId(
					/passage-/
				).length
			).toBe(1);
		});
	});

	describe('when a text area is focused', () => {
		let story: Story;

		beforeEach(() => {
			story = fakeStory(1);

			renderComponent(
				{story, passages: [story.passages[0]]},
				{stories: [story]}
			);
		});

		it("doesn't delete passages when the Delete key is pressed", () => {
			fireEvent.keyDown(document.querySelector('textarea')!, {
				key: 'Delete',
				code: 'Delete',
				keyCode: 46,
				charCode: 46
			});
			expect(
				within(screen.getByTestId('story-inspector-default')).queryAllByTestId(
					/passage-/
				).length
			).toBe(1);
		});

		it("doesn't delete passages when the Backspace key is pressed", () => {
			fireEvent.keyDown(document.querySelector('textarea')!, {
				key: 'Backspace',
				code: 'Backspace',
				keyCode: 8,
				charCode: 8
			});
			expect(
				within(screen.getByTestId('story-inspector-default')).queryAllByTestId(
					/passage-/
				).length
			).toBe(1);
		});
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
