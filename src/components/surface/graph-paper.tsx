import * as React from 'react';
import './graph-paper.css';

export interface GraphPaperProps {
	zoom: number;
}

export const GraphPaper: React.FC<GraphPaperProps> = ({zoom}) => {
	// Note that we have four backgrounds, one for each set of lines.

	const major = 100 * zoom;
	const minor = 25 * zoom;

	const backgroundSize = `${major}px ${major}px, ${major}px ${major}px, ${minor}px ${minor}px, ${minor}px ${minor}px`;

	return <div className="graph-paper" style={{backgroundSize}} />;
};
