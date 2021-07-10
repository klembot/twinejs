import * as React from 'react';
import './card-group.css';

export type CardGroupProps =
	| {columns: number; maxWidth?: string}
	| {columnWidth: number | string; maxWidth?: string};

export const CardGroup: React.FC<CardGroupProps> = props => {
	const style: React.CSSProperties = {
		gridTemplateColumns:
			'columnWidth' in props
				? `repeat(auto-fit, ${
						typeof props.columnWidth === 'number'
							? props.columnWidth + 'px'
							: props.columnWidth
				  })`
				: `repeat(${props.columns}, 1fr)`,
		maxWidth: props.maxWidth ?? 'auto'
	};

	return (
		<div className="card-group" style={style}>
			{props.children}
		</div>
	);
};
