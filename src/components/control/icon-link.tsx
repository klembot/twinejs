import * as React from 'react';
import classNames from 'classnames';
import {Icon} from '../image/icon/icon';
import './icon-button-link.css';

export interface IconLinkProps {
	href: string;
	icon: string;
	label: string;
	variant?: 'create' | 'danger' | 'primary' | 'secondary';
	target?: string;
}

export const IconLink: React.FC<IconLinkProps> = props => {
	const {href, icon, label, target, variant} = props;
	const className = classNames('icon-link', `variant-${variant}`);

	return (
		<a href={href} className={className} target={target ?? '_blank'}>
			<Icon icon={icon} />
			{label}
		</a>
	);
};
