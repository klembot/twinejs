import * as React from 'react';
import './badge.css';

export interface BadgeProps {
	label: string;
}

export const Badge: React.FC<BadgeProps> = ({label}) => (
	<span className="badge">{label}</span>
);
