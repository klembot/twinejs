import * as React from 'react';
import {IconButton, IconButtonProps} from './icon-button';

export interface CheckboxButtonProps
	extends Omit<IconButtonProps, 'icon' | 'onClick'> {
	checkedIcon?: string;
	icon?: string;
	onChange: (value: boolean) => void;
	uncheckedIcon?: string;
	value: boolean;
}

// TODO: replace menu items with this

export const CheckboxButton: React.FC<CheckboxButtonProps> = props => {
	const {
		checkedIcon,
		icon,
		onChange,
		uncheckedIcon,
		value,
		...otherProps
	} = props;
	const calculatedIcon = value
		? checkedIcon ?? 'check-square'
		: uncheckedIcon ?? 'square';

	return (
		<span role="checkbox" aria-checked={value}>
			<IconButton
				icon={icon ?? calculatedIcon}
				onClick={() => onChange(!value)}
				{...otherProps}
			/>
		</span>
	);
};
