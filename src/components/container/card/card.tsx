import * as React from 'react';
import classNames from 'classnames';
import './card.css';

export interface CardProps {
	floating?: boolean;
	highlighted?: boolean;
}

export const Card: React.FC<CardProps> = props => {
	const {children, floating, highlighted} = props;

	const className = classNames('card', {
		floating,
		highlighted
	});

	return <div className={className}>{children}</div>;
};
