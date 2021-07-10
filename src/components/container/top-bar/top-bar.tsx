import * as React from 'react';
import {ButtonBar} from '../button-bar';
import './top-bar.css';

interface TopBarProps {}

export const TopBar: React.FC<TopBarProps> = ({children}) => (
	<div className="top-bar">
		<ButtonBar>{children}</ButtonBar>
	</div>
);
