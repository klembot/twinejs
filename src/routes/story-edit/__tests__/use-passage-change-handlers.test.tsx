import * as React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {Story, useStoriesContext} from '../../../store/stories';
import {fakeStory, FakeStateProvider, StoryInspector} from '../../../test-util';
import {usePassageChangeHandlers} from '../use-passage-change-handlers';

jest.mock('../../../dialogs/passage-edit/passage-edit-stack');

function TestComponent() {
	const {stories} = useStoriesContext();
	const {
		handleDeselectPassage,
		handleDragPassages,
		handleEditPassage,
		handleSelectPassage,
		handleSelectRect
	} = usePassageChangeHandlers(stories[0]);
	return (
		<>
			<button onClick={() => handleDeselectPassage(stories[0].passages[0])}>
				handleDeselectPassage
			</button>
			<button onClick={() => handleDragPassages({left: 0, top: 0})}>
				handleDragPassages 0
			</button>
			<button onClick={() => handleDragPassages({left: 20, top: 10})}>
				handleDragPassages
			</button>
			<button onClick={() => handleEditPassage(stories[0].passages[0])}>
				handleEditPassage
			</button>
			<button
				onClick={() => handleSelectPassage(stories[0].passages[0], false)}
			>
				handleSelectPassage
			</button>
			<button onClick={() => handleSelectPassage(stories[0].passages[0], true)}>
				handleSelectPassage exclusive
			</button>
			<button
				onClick={() =>
					handleSelectRect({height: 100, left: 10, top: 20, width: 200}, false)
				}
			>
				handleSelectRect
			</button>
			<button
				onClick={() =>
					handleSelectRect({height: 100, left: 10, top: 20, width: 200}, true)
				}
			>
				handleSelectRect additive
			</button>
		</>
	);
}

describe('usePassageChangeHandlers', () => {
	function renderHook(story: Story) {
		return render(
			<FakeStateProvider stories={[story]}>
				<TestComponent />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	// These test basic functionality. Comprehensive tests happen in store/.

	it('returns a handleDeselectPassage function which deselects a passage', () => {
		const story = fakeStory(2);

		story.passages[0].selected = true;
		story.passages[1].selected = true;
		renderHook(story);
		expect(
			screen.getByTestId(`passage-${story.passages[0].id}`).dataset.selected
		).toBe('true');
		expect(
			screen.getByTestId(`passage-${story.passages[1].id}`).dataset.selected
		).toBe('true');
		fireEvent.click(screen.getByText('handleDeselectPassage'));
		expect(
			screen.getByTestId(`passage-${story.passages[0].id}`).dataset.selected
		).toBe('false');
		expect(
			screen.getByTestId(`passage-${story.passages[1].id}`).dataset.selected
		).toBe('true');
	});

	describe('The handleDragPassages function it returns', () => {
		it('moves selected passages', () => {
			const story = fakeStory(2);

			story.passages[0].left = 10;
			story.passages[0].selected = true;
			story.passages[0].top = 20;
			story.passages[1].selected = false;
			story.zoom = 1;
			renderHook(story);
			fireEvent.click(screen.getByText('handleDragPassages'));

			const passage0 = screen.getByTestId(`passage-${story.passages[0].id}`);
			const passage1 = screen.getByTestId(`passage-${story.passages[1].id}`);

			expect(passage0.dataset.left).toBe('30');
			expect(passage0.dataset.top).toBe('30');
			expect(passage1.dataset.left).toBe(story.passages[1].left.toString());
			expect(passage1.dataset.top).toBe(story.passages[1].top.toString());
		});

		it('ignores drags of less than a pixel', () => {
			const story = fakeStory(1);

			story.passages[0].left = 10;
			story.passages[0].selected = true;
			story.passages[0].top = 20;
			renderHook(story);
			fireEvent.click(screen.getByText('handleDragPassages 0'));

			const passage0 = screen.getByTestId(`passage-${story.passages[0].id}`);

			expect(passage0.dataset.left).toBe('10');
			expect(passage0.dataset.top).toBe('20');
		});
	});

	it('returns a handleEditPassage function which opens a passage editor', () => {
		const story = fakeStory(1);

		renderHook(story);
		fireEvent.click(screen.getByText('handleEditPassage'));

		const editDialog = screen.getByTestId('mock-passage-edit-stack');

		expect(editDialog).toBeInTheDocument();
		expect(editDialog.dataset.passageIds).toBe(
			JSON.stringify([story.passages[0].id])
		);
	});

	describe('The handleSelectPassage function it returns', () => {
		let story: Story;

		beforeEach(() => {
			story = fakeStory(2);
			story.passages[0].selected = false;
			story.passages[1].selected = true;
			renderHook(story);
		});

		it('selects passages non-exclusively if called with a false argument', () => {
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset.selected
			).toBe('false');
			expect(
				screen.getByTestId(`passage-${story.passages[1].id}`).dataset.selected
			).toBe('true');
			fireEvent.click(screen.getByText('handleSelectPassage'));
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset.selected
			).toBe('true');
			expect(
				screen.getByTestId(`passage-${story.passages[1].id}`).dataset.selected
			).toBe('true');
		});

		it('selects passages exclusively if called with a true argument', () => {
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset.selected
			).toBe('false');
			expect(
				screen.getByTestId(`passage-${story.passages[1].id}`).dataset.selected
			).toBe('true');
			fireEvent.click(screen.getByText('handleSelectPassage exclusive'));
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset.selected
			).toBe('true');
			expect(
				screen.getByTestId(`passage-${story.passages[1].id}`).dataset.selected
			).toBe('false');
		});
	});

	describe('The handleSelectRect function it returns', () => {
		let story: Story;

		beforeEach(() => {
			story = fakeStory(2);
			story.passages[0].left = 50;
			story.passages[0].selected = false;
			story.passages[0].top = 50;
			story.passages[1].left = 1000;
			story.passages[1].selected = true;
			story.passages[1].top = 1000;
			story.zoom = 1;
			renderHook(story);
		});

		it('selects passages exclusively if called with a false argument', async () => {
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset.selected
			).toBe('false');
			expect(
				screen.getByTestId(`passage-${story.passages[1].id}`).dataset.selected
			).toBe('true');
			fireEvent.click(screen.getByText('handleSelectRect'));
			await waitFor(() =>
				expect(
					screen.getByTestId(`passage-${story.passages[0].id}`).dataset.selected
				).toBe('true')
			);
			expect(
				screen.getByTestId(`passage-${story.passages[1].id}`).dataset.selected
			).toBe('false');
		});

		it('selects passages non-exclusively if called with a true argument', () => {
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset.selected
			).toBe('false');
			expect(
				screen.getByTestId(`passage-${story.passages[1].id}`).dataset.selected
			).toBe('true');
			fireEvent.click(screen.getByText('handleSelectRect additive'));
			expect(
				screen.getByTestId(`passage-${story.passages[0].id}`).dataset.selected
			).toBe('true');
			expect(
				screen.getByTestId(`passage-${story.passages[1].id}`).dataset.selected
			).toBe('true');
		});
	});
});
