import * as React from 'react';
import './card-footer.css';

export const CardFooter: React.FC = ({children}) => (
	<div className="card-actions">{children}</div>
);
