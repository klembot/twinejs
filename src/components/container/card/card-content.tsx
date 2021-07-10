import * as React from 'react';
import './card-content.css';

export const CardContent: React.FC = ({children}) => (
	<div className="card-content">{children}</div>
);
