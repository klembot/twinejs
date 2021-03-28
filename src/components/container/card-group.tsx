import * as React from 'react';
import './card-group.css';

export interface CardGroupProps {
	columns?: number;
	columnWidth?: string;
	maxWidth?: string;
}

export const CardGroup: React.FC<CardGroupProps> = props => {
	const {columns, columnWidth, maxWidth} = props;
	const style: React.CSSProperties = {
		gridTemplateColumns: columnWidth
			? `repeat(auto-fit, ${columnWidth})`
			: `repeat(${columns}, 1fr)`,
		maxWidth: maxWidth ?? 'auto'
	};

	return (
		<div className="card-group" style={style}>
			{props.children}
		</div>
	);
};
