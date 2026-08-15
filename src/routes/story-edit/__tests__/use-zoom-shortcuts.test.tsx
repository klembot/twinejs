import * as React from 'react';
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
			<FakeStateProvider hotkeyScope="story-map" stories={[story]}>
				<TestZoomShortcuts />
				<StoryInspector />
			</FakeStateProvider>
		);
	}

	function pressKey(key: string) {
		fireEvent.keyDown(document.activeElement!, {code: key, key});
	}

	function zoom() {
		return screen.getByTestId('story-inspector-default').dataset.zoom;
	}

	describe('when the = key is pressed', () => {
		it('increases the story zoom', () => {
			const story = fakeStory();

			story.zoom = 0.3;
			renderComponent(story);
			pressKey('=');
			expect(zoom()).toBe('0.6');
			cleanup();
			story.zoom = 0.6;
			renderComponent(story);
			pressKey('=');
			expect(zoom()).toBe('1');
		});

		it('does not increase the story zoom if it is 1', () => {
			const story = fakeStory();

			story.zoom = 1;
			renderComponent(story);
			pressKey('=');
			expect(zoom()).toBe('1');
		});
	});

	describe('when the - key is pressed', () => {
		it('decreases the story zoom', () => {
			const story = fakeStory();

			story.zoom = 1;
			renderComponent(story);
			pressKey('-');
			expect(zoom()).toBe('0.6');
			cleanup();
			story.zoom = 0.6;
			renderComponent(story);
			pressKey('-');
			expect(zoom()).toBe('0.3');
		});

		it('does not decrease the story zoom if it is 0.3', () => {
			const story = fakeStory();

			story.zoom = 0.3;
			renderComponent(story);
			pressKey('-');
			expect(zoom()).toBe('0.3');
		});
	});

	describe('when the 0 key is pressed', () => {
		it('resets the story zoom to 1', () => {
			const story = fakeStory();

			story.zoom = 0.3;
			renderComponent(story);
			pressKey('0');
			expect(zoom()).toBe('1');
		});
	});

	it('ignores auto-repeated keys, so that holding a key down zooms once', () => {
		const story = fakeStory();

		story.zoom = 1;
		renderComponent(story);
		fireEvent.keyDown(document.activeElement!, {
			code: '-',
			key: '-',
			repeat: true
		});
		expect(zoom()).toBe('1');
	});

	it('does not zoom when a text field has focus', () => {
		const story = fakeStory();

		story.zoom = 1;
		renderComponent(story);

		const input = document.createElement('input');

		document.body.appendChild(input);
		input.focus();
		fireEvent.keyDown(input, {code: '-', key: '-'});
		expect(zoom()).toBe('1');
		document.body.removeChild(input);
	});
});
