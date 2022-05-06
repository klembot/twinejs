import * as React from 'react';
import {Story} from '../../store/stories';
import {hueString} from '../../util/hue-string';
import './story-preview.css';

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

	let minX = Number.POSITIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;

	const circles = story.passages.map(passage => ({
		key: passage.name,
		x: passage.left + passage.width / 2,
		y: passage.top + passage.height / 2,
		radius: Math.max(passage.width, passage.height)
	}));

	const svg = circles
		.reduce<[React.ReactNode[], React.ReactNode[]]>(
			(result, circle, index) => {
				// We reduce the circles to an array with two elements so that the
				// larger, faded circles appear below the smaller, more solid ones.

				const bgRadius = circle.radius + 200;

				// Kind of gross to do side effects in a reduce(), but it saves an O(n).

				minX = Math.min(minX, circle.x - bgRadius);
				minY = Math.min(minY, circle.y - bgRadius);
				maxX = Math.max(maxX, circle.x + bgRadius);
				maxY = Math.max(maxY, circle.y + bgRadius);

				result[0].push(
					<circle
						cx={circle.x}
						cy={circle.y}
						key={`${circle.key}-bg`}
						r={bgRadius}
						style={{
							fill: `hsl(${hues[index % hues.length]}, 80%, 80%)`
						}}
					/>
				);

				result[1].push(
					<circle
						cx={circle.x}
						cy={circle.y}
						key={`${circle.key}-fg`}
						r={circle.radius}
						style={{
							fill: `hsl(${hues[index % hues.length]}, 80%, 60%)`
						}}
					/>
				);

				return result;
			},
			[[], []]
		)
		.map((nodes, index) => (
			<g className={`story-preview-${index === 0 ? 'bg' : 'fg'}`} key={index}>
				{nodes}
			</g>
		));

	const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

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

StoryPreview.displayName = 'StoryPreview';