import * as React from 'react';
import {IconSquare, IconSquareCheck} from '@tabler/icons';
import {IconButton, IconButtonProps} from './icon-button';

export interface CheckboxButtonProps
	extends Omit<IconButtonProps, 'icon' | 'onClick'> {
	checkedIcon?: React.ReactNode;
	icon?: React.ReactNode;
	onChange: (value: boolean) => void;
	uncheckedIcon?: React.ReactNode;
	value: boolean;
}

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
		? checkedIcon ?? <IconSquareCheck />
		: uncheckedIcon ?? <IconSquare />;

	return (
		<IconButton
			icon={icon ?? calculatedIcon}
			onClick={() => onChange(!value)}
			role="checkbox"
			ariaChecked={value}
			{...otherProps}
		/>
	);
};
