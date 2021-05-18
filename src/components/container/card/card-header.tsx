import * as React from 'react';
import './card-header.css';

export interface CardHeaderProps {
	level?: 1 | 2;
}

export const CardHeader: React.FC<CardHeaderProps> = ({children}) => (
	<div className="card-header">{children}</div>
);
