import * as React from 'react';
import {hueString} from '../../util/hue-string';
import {Story} from '../../store/stories';

/**
 * Returns the appropriate radius for a passage "bubble" in the preview given
 * the length of its text, and the length of the longest passage in the story.
 */
function passageRadius(length: number, longestLength: number) {
	return (200 + 200 * (length / longestLength)) / 2;
}

export interface StoryPreviewProps {
	story: Story;
}

export const StoryPreview: React.FC<StoryPreviewProps> = ({story}) => {
	const {passages, name} = story;
	const hue = hueString(name);
	const style = {
		background: `hsl(${hue}, 90%, 85%)`,
		fill: `hsla(${(hue + 45) % 360}, 90%, 40%, 0.25)`,
		padding: 'var(--grid-size)'
	};

	const longestPassageLength = React.useMemo(
		() =>
			passages.reduce((result, current) => {
				if (current.text.length > result) {
					return current.text.length;
				}

				return result;
			}, 0),
		[passages]
	);

	const viewBox = React.useMemo(() => {
		if (passages.length < 2) {
			return '25 25 150 150';
		}

		let minX = Number.POSITIVE_INFINITY;
		let minY = Number.POSITIVE_INFINITY;
		let maxX = Number.NEGATIVE_INFINITY;
		let maxY = Number.NEGATIVE_INFINITY;

		passages.forEach(p => {
			const x = p.left + p.width / 2;
			const y = p.top + p.height / 2;
			const radius = passageRadius(p.text.length, longestPassageLength);

			if (x - radius < minX) {
				minX = x - radius;
			}

			if (x + radius > maxX) {
				maxX = x + radius;
			}

			if (y - radius < minY) {
				minY = y - radius;
			}

			if (y + radius > maxY) {
				maxY = y + radius;
			}
		});

		return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
	}, [longestPassageLength, passages]);

	const svg = React.useMemo(() => {
		if (passages.length < 2) {
			return <circle cx="100" cy="100" r="75" />;
		}

		return passages.map(p => (
			<circle
				cx={p.left + p.width / 2}
				cy={p.top + p.height / 2}
				key={p.id}
				r={passageRadius(p.text.length, longestPassageLength)}
			/>
		));
	}, [longestPassageLength, passages]);

	return (
		<svg
			className="story-preview"
			style={style}
			viewBox={viewBox}
			xmlns="http://www.w3.org/2000/svg"
		>
			{svg}
		</svg>
	);
};
