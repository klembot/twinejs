import * as React from 'react';
import './card-actions.css';

export const CardActions: React.FC = ({children}) => (
	<div className="card-actions">{children}</div>
);
