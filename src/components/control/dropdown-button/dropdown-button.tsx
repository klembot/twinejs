import * as React from 'react';
import {
	ControlledDropdownButton,
	ControlledDropdownButtonProps
} from './controlled-dropdown-button';

export interface DropdownButtonProps
	extends Omit<ControlledDropdownButtonProps, 'onClick' | 'open'> {
	onClose?: () => void;
	onOpen?: () => void;
}

export const DropdownButton: React.FC<DropdownButtonProps> = props => {
	const {onClose, onOpen, ...otherProps} = props;
	const [open, setOpen] = React.useState(false);

	React.useEffect(() => {
		if (open) {
			// TODO: close on clicks outside the menu
			// TODO: close on clicks inside menu

			if (onOpen) {
				onOpen();
			}
		}

		if (!open && onClose) {
			onClose();
		}
	}, [onClose, onOpen, open]);

	return (
		<ControlledDropdownButton
			onClick={() => setOpen(open => !open)}
			open={open}
			{...otherProps}
		/>
	);
};
