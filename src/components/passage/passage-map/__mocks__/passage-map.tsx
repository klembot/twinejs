import * as React from 'react';
import {fakePassage} from '../../../../test-util';
import {PassageMapProps} from '../passage-map';

export const PassageMap: React.FC<Partial<PassageMapProps>> = props => (
	<div
		data-testid="mock-passage-map"
		data-format-name={props.formatName}
		data-format-version={props.formatVersion}
		data-visible-zoom={props.visibleZoom}
		data-zoom={props.zoom}
	>
		{props.passages &&
			props.passages.map(passage => (
				<div
					data-testid={`mock-passage-${passage.id}`}
					data-selected={passage.selected}
					data-tag-colors={JSON.stringify(props.tagColors)}
					key={passage.id}
				/>
			))}
		<button onClick={() => props.onDeselect!(fakePassage())}>onDeselect</button>
		<button onClick={() => props.onDrag!({top: 15, left: 20})}>onDrag</button>
		<button onClick={() => props.onEdit!(fakePassage())}>onEdit</button>
		<button onClick={() => props.onSelect!(fakePassage(), true)}>
			onSelect
		</button>
	</div>
);
