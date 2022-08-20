import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {
	fakePassage,
	fakeStory,
	fakeUnloadedStoryFormat
} from '../../../test-util';
import {
	MarqueeablePassageMap,
	MarqueeablePassageMapProps
} from '../marqueeable-passage-map';

const TestMarqueeablePassageMap: React.FC<
	Omit<MarqueeablePassageMapProps, 'container'>
> = props => {
	const containerRef = React.useRef(null);

	return (
		<div ref={containerRef}>
			<MarqueeablePassageMap container={containerRef} {...props} />
		</div>
	);
};

jest.mock('../../../components/marquee-selection/marquee-selection');
jest.mock('../../../components/passage/passage-map/passage-map');

describe('<MarqueeablePassageMap>', () => {
	function renderComponent(props?: Partial<MarqueeablePassageMapProps>) {
		const format = fakeUnloadedStoryFormat();
		const story = fakeStory(1);

		return render(
			<TestMarqueeablePassageMap
				formatName={format.name}
				formatVersion={format.version}
				onDeselect={jest.fn()}
				onDrag={jest.fn()}
				onEdit={jest.fn()}
				onSelect={jest.fn()}
				onSelectRect={jest.fn()}
				passages={story.passages}
				startPassageId={story.passages[0].id}
				tagColors={{}}
				visibleZoom={story.zoom}
				zoom={story.zoom}
				{...props}
			/>
		);
	}

	it('overrides the selected state of passages while the user is dragging', async () => {
		const passages = [
			fakePassage({
				selected: false,
				top: 50,
				left: 50
			}),
			fakePassage({
				selected: false,
				top: 5000,
				left: 5000
			})
		];

		renderComponent({passages});
		expect(
			screen.getByTestId(`mock-passage-${passages[0].id}`).dataset.selected
		).toBe('false');
		expect(
			screen.getByTestId(`mock-passage-${passages[1].id}`).dataset.selected
		).toBe('false');
		fireEvent.click(screen.getByText('onTemporarySelectRect'));
		await waitFor(() =>
			expect(
				screen.getByTestId(`mock-passage-${passages[0].id}`).dataset.selected
			).toBe('true')
		);
		expect(
			screen.getByTestId(`mock-passage-${passages[1].id}`).dataset.selected
		).toBe('false');
	});

	it('overrides the selected state of passages while the user is dragging additively', async () => {
		const passages = [
			fakePassage({
				height: 100,
				selected: false,
				top: 50,
				left: 50,
				width: 100
			}),
			fakePassage({
				height: 100,
				selected: true,
				top: 5000,
				left: 5000,
				width: 100
			})
		];

		renderComponent({passages});
		expect(
			screen.getByTestId(`mock-passage-${passages[0].id}`).dataset.selected
		).toBe('false');
		expect(
			screen.getByTestId(`mock-passage-${passages[1].id}`).dataset.selected
		).toBe('true');
		fireEvent.click(screen.getByText('onTemporarySelectRect additive'));
		await waitFor(() =>
			expect(
				screen.getByTestId(`mock-passage-${passages[0].id}`).dataset.selected
			).toBe('true')
		);
		expect(
			screen.getByTestId(`mock-passage-${passages[1].id}`).dataset.selected
		).toBe('true');
	});

	it('returns to the outer passage state after a user drag', () => {
		const passages = [
			fakePassage({
				selected: false,
				top: 50,
				left: 50
			}),
			fakePassage({
				selected: false,
				top: 5000,
				left: 5000
			})
		];

		renderComponent({passages});
		fireEvent.click(screen.getByText('onTemporarySelectRect'));
		fireEvent.click(screen.getByText('onSelectRect'));

		// Both are false because we don't have a state context set up.

		expect(
			screen.getByTestId(`mock-passage-${passages[0].id}`).dataset.selected
		).toBe('false');
		expect(
			screen.getByTestId(`mock-passage-${passages[1].id}`).dataset.selected
		).toBe('false');
	});

	it('calls the onSelectRect prop when a selection finishes', () => {
		const onSelectRect = jest.fn();

		renderComponent({onSelectRect});
		fireEvent.click(screen.getByText('onSelectRect'));
		fireEvent.click(screen.getByText('onSelectRect additive'));
		expect(onSelectRect.mock.calls).toEqual([
			[{top: 10, left: 10, height: 150, width: 100}, false],
			[{top: 10, left: 10, height: 150, width: 100}, true]
		]);
	});

	it('passes through props to <PassageMap>', () => {
		const format = fakeUnloadedStoryFormat();
		const callbacks = {
			onDeselect: jest.fn(),
			onDrag: jest.fn(),
			onEdit: jest.fn(),
			onSelect: jest.fn()
		};

		renderComponent({
			...callbacks,
			formatName: format.name,
			formatVersion: format.version,
			visibleZoom: 0.5,
			zoom: 0.75
		});

		const passageMap = screen.getByTestId('mock-passage-map');

		expect(passageMap.dataset.formatName).toBe(format.name);
		expect(passageMap.dataset.formatVersion).toBe(format.version);
		expect(passageMap.dataset.visibleZoom).toBe('0.5');
		expect(passageMap.dataset.zoom).toBe('0.75');

		for (const name in callbacks) {
			expect(callbacks[name as keyof typeof callbacks]).not.toHaveBeenCalled();
			fireEvent.click(screen.getByText(name));
			expect(callbacks[name as keyof typeof callbacks]).toHaveBeenCalledTimes(
				1
			);
		}
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
