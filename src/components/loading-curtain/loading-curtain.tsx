import * as React from 'react';
import {IconLoading} from '../image/icon';
import './loading-curtain.css';

export const LoadingCurtain: React.FC = () => (
	<div className="loading-curtain">
		<IconLoading />
	</div>
);
