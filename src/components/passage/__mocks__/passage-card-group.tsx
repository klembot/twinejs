import * as React from 'react';
import {PassageCardGroupProps} from '../passage-card-group';

export const PassageCardGroup: React.FC<PassageCardGroupProps> = ({
	onDragStart,
	onDrag,
	passages
}) => {
	function simulateDrag() {
		const fakeEl = document.createElement('div');

		onDragStart!(new MouseEvent('mousedown'), {
			deltaX: 0,
			deltaY: 0,
			lastX: 10,
			lastY: 20,
			node: fakeEl,
			x: 10,
			y: 20
		});
		onDrag!(new MouseEvent('mousemove'), {
			deltaX: 5,
			deltaY: 10,
			lastX: 10,
			lastY: 20,
			node: fakeEl,
			x: 15,
			y: 30
		});
	}

	return (
		<div
			data-testid={`mock-passage-card-group-${passages
				.map(p => p.name)
				.join('-')}`}
		>
			<button onClick={simulateDrag}>simulate drag</button>
		</div>
	);
};
