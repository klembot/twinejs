import * as React from 'react';
import classNames from 'classnames';
import './card.css';

export interface CardProps {
	floating?: boolean;
	highlighted?: boolean;
	selected?: boolean;
}

export const Card: React.FC<CardProps> = props => {
	const {children, floating, highlighted, selected} = props;

	const className = classNames('card', {
		floating,
		highlighted,
		selected
	});

	return <div className={className}>{children}</div>;
};
