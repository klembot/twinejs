import * as React from 'react';
import './top-bar.css';

interface TopBarProps {}

export const TopBar: React.FC<TopBarProps> = ({children}) => (
	<div className="top-bar">{children}</div>
);
