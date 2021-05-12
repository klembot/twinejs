import * as React from 'react';
import {IconSquare, IconSquareCheck} from '@tabler/icons';
import {IconButton, IconButtonProps} from './icon-button';

export interface CheckboxButtonProps
	extends Omit<IconButtonProps, 'icon' | 'onClick'> {
	checkedIcon?: string;
	icon?: string;
	onChange: (value: boolean) => void;
	uncheckedIcon?: string;
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
		<span className="checkbox-button" role="checkbox" aria-checked={value}>
			<IconButton
				icon={icon ?? calculatedIcon}
				onClick={() => onChange(!value)}
				{...otherProps}
			/>
		</span>
	);
};
