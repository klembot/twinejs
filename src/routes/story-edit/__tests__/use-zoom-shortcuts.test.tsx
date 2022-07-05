import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {Story, useStoriesContext} from '../../../store/stories';
import {FakeStateProvider, fakeStory, StoryInspector} from '../../../test-util';
import {useZoomShortcuts} from '../use-zoom-shortcuts';

const TestZoomShortcuts: React.FC = () => {
	const {stories} = useStoriesContext();

	useZoomShortcuts(stories[0]);
	return <div>test zoom shortcut</div>;
};

describe('useZoomShortcuts()', () => {
	function renderComponent(story: Story) {
		return render(
			<FakeStateProvider stories={[story]}>
				<TestZoomShortcuts />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	describe('when the + key is pressed', () => {
		it('increases the story zoom', async () => {
			const story = fakeStory();

			story.zoom = 0.3;
			renderComponent(story);
			fireEvent.keyUp(document.body, {
				key: '=',
				code: '=',
				keyCode: 187,
				charCode: 187
			});
			expect(screen.getByTestId('story-inspector-default').dataset.zoom).toBe(
				'0.6'
			);
			cleanup();
			story.zoom = 0.6;
			renderComponent(story);
			fireEvent.keyUp(document.body, {
				key: '=',
				code: '=',
				keyCode: 187,
				charCode: 187
			});
			expect(screen.getByTestId('story-inspector-default').dataset.zoom).toBe(
				'1'
			);
		});

		it('does not increase the story zoom if it is 1', () => {
			const story = fakeStory();

			story.zoom = 1;
			renderComponent(story);
			fireEvent.keyUp(document.body, {
				key: '=',
				code: '=',
				keyCode: 187,
				charCode: 187
			});
			expect(screen.getByTestId('story-inspector-default').dataset.zoom).toBe(
				'1'
			);
		});
	});

	describe('when the - key is pressed', () => {
		it('decreases the story zoom', () => {
			const story = fakeStory();

			story.zoom = 1;
			renderComponent(story);
			fireEvent.keyUp(document.body, {
				key: '-',
				code: '-',
				keyCode: 189,
				charCode: 189
			});
			expect(screen.getByTestId('story-inspector-default').dataset.zoom).toBe(
				'0.6'
			);
			cleanup();
			story.zoom = 0.6;
			renderComponent(story);
			fireEvent.keyUp(document.body, {
				key: '-',
				code: '-',
				keyCode: 189,
				charCode: 189
			});
			expect(screen.getByTestId('story-inspector-default').dataset.zoom).toBe(
				'0.3'
			);
		});

		it('does not decrease the story zoom if it is 0.3', () => {
			const story = fakeStory();

			story.zoom = 0.3;
			renderComponent(story);
			fireEvent.keyUp(document.body, {
				key: '-',
				code: '-',
				keyCode: 189,
				charCode: 189
			});
			expect(screen.getByTestId('story-inspector-default').dataset.zoom).toBe(
				'0.3'
			);
		});
	});

	it('does not react to keydown events', () => {
		const story = fakeStory();

		story.zoom = 0.6;
		renderComponent(story);
		fireEvent.keyDown(document.body, {
			key: '-',
			code: '-',
			keyCode: 189,
			charCode: 189
		});
		expect(screen.getByTestId('story-inspector-default').dataset.zoom).toBe(
			'0.6'
		);
		fireEvent.keyDown(document.body, {
			key: '=',
			code: '=',
			keyCode: 187,
			charCode: 187
		});
		expect(screen.getByTestId('story-inspector-default').dataset.zoom).toBe(
			'0.6'
		);
	});
});
