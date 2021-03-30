import * as React from 'react';
import {Icon} from '../image/icon/icon';
import './loading-curtain.css';

export const LoadingCurtain: React.FC = () => (
	<div className="loading-curtain">
		<Icon icon="loading-spinner" />
	</div>
);
