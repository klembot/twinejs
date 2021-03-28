import * as React from 'react';
import classNames from 'classnames';
import './card.css';

export interface CardProps {
	compact?: boolean;
	highlighted?: boolean;
	selected?: boolean;
}

export const Card: React.FC<CardProps> = props => {
	const {children, compact, highlighted, selected} = props;

	const className = classNames('card', {
		compact: compact,
		highlighted: highlighted,
		selected: selected
	});

	return <div className={className}>{children}</div>;
};
