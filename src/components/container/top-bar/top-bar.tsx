import * as React from 'react';
import {ButtonBar} from '../button-bar';
import './top-bar.css';

interface TopBarProps {}

// TODO: add back button functionality, either popping route history or adding to it

export const TopBar: React.FC<TopBarProps> = ({children}) => (
	<div className="top-bar">
		<ButtonBar>{children}</ButtonBar>
	</div>
);
