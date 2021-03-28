import * as React from 'react';
import './card-body.css';

export const CardBody: React.FC = ({children}) => (
	<div className="card-body">{children}</div>
);
