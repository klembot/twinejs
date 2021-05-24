import * as React from 'react';
import {hueString} from '../../util/hue-string';
import {Story} from '../../store/stories';

export interface StoryPreviewProps {
	story: Story;
}

export const StoryPreview: React.FC<StoryPreviewProps> = React.memo(props => {
	const {story} = props;
	const hues = [hueString(story.name)];

	hues.push((hues[0] + 15) % 360);
	hues.push((hues[0] - 15) % 360);
	hues.push((hues[0] + 30) % 360);
	hues.push((hues[0] - 30) % 360);
	hues.push((hues[0] + 60) % 360);

	const {circles, maxSize} = story.passages.reduce(
		(result, passage) => ({
			circles: [
				...result.circles,
				{
					key: passage.name,
					size: passage.text.length,

					// Jitter the passages off a strict grid.

					x: passage.left + 50 - (hueString(passage.name) % 100),
					y: passage.top + 50 - (hueString(passage.name) % 100)
				}
			],
			maxSize: Math.max(passage.text.length, result.maxSize)
		}),
		{
			circles: [] as {key: string; size: number; x: number; y: number}[],
			maxSize: 0
		}
	);

	// Sort such that longer text (e.g. larger circles) will be drawn last. This
	// disrupts the story structure so it doesn't feel as schematic.

	const sortedCircles = circles.sort((a, b) => a.size - b.size);
	let minX = Number.POSITIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;

	const svg =
		circles.length < 2 ? (
			<circle
				cx="50"
				cy="50"
				r="50"
				style={{fill: `hsla(${hues[0]}, 90%, 70%, 0.25)`}}
			/>
		) : (
			sortedCircles.map((circle, index) => {
				const lengthRatio = circle.size / maxSize;
				const radius = 150 + 1000 * lengthRatio;
				const alpha = 0.3 + 0.3 * (1 - lengthRatio);

				// Kind of gross to do side effects in a map(), but it saves an O(n).

				minX = Math.min(minX, circle.x - radius);
				minY = Math.min(minY, circle.y - radius);
				maxX = Math.max(maxX, circle.x + radius);
				maxY = Math.max(maxY, circle.y + radius);

				return (
					<circle
						cx={circle.x}
						cy={circle.y}
						key={circle.key}
						r={radius}
						style={{
							fill: `hsla(${hues[index % hues.length]}, 80%, 60%, ${alpha})`
						}}
					/>
				);
			})
		);

	const viewBox =
		circles.length < 2
			? '0 0 100 100'
			: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

	return (
		<svg
			className="story-preview"
			viewBox={viewBox}
			xmlns="http://www.w3.org/2000/svg"
		>
			{svg}
		</svg>
	);
});
