import * as React from 'react';
import classNames from 'classnames';
import {Icon} from '../image/icon/icon';
import './icon-button-link.css';

export interface IconButtonProps {
	buttonType?: 'button' | 'submit';
	disabled?: boolean;
	icon: string;
	iconOnly?: boolean;
	iconPosition?: 'start' | 'end';
	label: string;
	onClick?: (e: React.MouseEvent) => void;
	preventDefault?: boolean;
	variant?: 'create' | 'danger' | 'primary' | 'secondary';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
	(props, ref) => {
		const {
			disabled,
			icon,
			iconOnly,
			iconPosition,
			onClick,
			preventDefault,
			variant
		} = props;

		// TODO: don't add classes for undefined position/variant

		const className = classNames(
			'icon-button',
			`icon-position-${iconPosition}`,
			`variant-${variant}`,
			{'icon-only': iconOnly}
		);

		const handleOnClick = (e: React.MouseEvent) => {
			onClick && onClick(e);

			if (preventDefault) {
				e.preventDefault();
			}
		};

		return (
			<button
				aria-label={iconOnly ? props.label : undefined}
				disabled={disabled}
				className={className}
				onClick={handleOnClick}
				ref={ref}
			>
				<Icon icon={icon} />
				{!iconOnly && props.label}
			</button>
		);
	}
);
