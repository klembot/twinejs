import * as React from 'react';
import classNames from 'classnames';
import './icon-button-link.css';

export interface IconLinkProps {
	href: string;
	icon: React.ReactNode;
	label: string;
	variant?: 'create' | 'danger' | 'primary' | 'secondary';
	target?: string;
}

export const IconLink: React.FC<IconLinkProps> = props => {
	const {href, icon, label, target, variant} = props;
	const className = classNames('icon-link', `variant-${variant}`);

	return (
		<a href={href} className={className} target={target ?? '_blank'}>
			<span className="icon">{icon}</span>
			{label}
		</a>
	);
};
