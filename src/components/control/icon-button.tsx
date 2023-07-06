import * as React from 'react';
import classNames from 'classnames';
import './icon-button-link.css';
import {Tooltip, TooltipProps} from '../tooltip';

export interface IconButtonProps {
	ariaChecked?: boolean;
	buttonType?: 'button' | 'submit';
	disabled?: boolean;
	/**
	 * Allows overridding the `label` prop as it's rendered onscreen, e.g. to
	 * apply formatting to the label. If omitted, label is used as-is.
	 */
	displayLabel?: React.ReactNode;
	icon: React.ReactNode;
	iconOnly?: boolean;
	iconPosition?: 'start' | 'end';
	label: string;
	onClick?: (e: React.MouseEvent) => void;
	preventDefault?: boolean;
	role?: string;
	selectable?: boolean;
	selected?: boolean;
	tooltipPosition?: TooltipProps['position'];
	variant?: 'create' | 'danger' | 'primary' | 'secondary';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
	(props, ref) => {
		const {
			ariaChecked,
			disabled,
			icon,
			iconOnly,
			iconPosition = 'start',
			onClick,
			preventDefault,
			role,
			selectable = false,
			selected = false,
			tooltipPosition,
			variant = 'secondary'
		} = props;
		const className = classNames(
			'icon-button',
			`icon-position-${iconPosition}`,
			{selected: selected},
			`variant-${variant}`,
			{'icon-only': iconOnly}
		);
		const [button, setButton] = React.useState<HTMLButtonElement | null>(null);
		React.useImperativeHandle(ref, () => button as HTMLButtonElement);
		const handleOnClick = (e: React.MouseEvent) => {
			onClick && onClick(e);

			if (preventDefault) {
				e.preventDefault();
			}
		};

		return (
			<>
				<button
					aria-checked={ariaChecked}
					aria-label={iconOnly ? props.label : undefined}
					aria-pressed={selectable ? selected : undefined}
					disabled={disabled}
					className={className}
					onClick={handleOnClick}
					ref={setButton}
					role={role}
				>
					<span className="icon">{icon}</span>
					{!iconOnly && (props.displayLabel ?? props.label)}
				</button>
				{iconOnly && (
					<Tooltip
						anchor={button}
						label={props.label}
						position={tooltipPosition}
					/>
				)}
			</>
		);
	}
);
