import * as React from 'react';
import {IconButton, IconButtonProps} from '../icon-button';
import {usePopper} from 'react-popper';
import './controlled-dropdown-button.css';

export interface ControlledDropdownButtonProps extends IconButtonProps {
	open: boolean;
}

export const ControlledDropdownButton: React.FC<ControlledDropdownButtonProps> = props => {
	const {children, open, ...otherProps} = props;
	const [buttonEl, setButtonEl] = React.useState<HTMLButtonElement | null>(
		null
	);
	const [menuEl, setMenuEl] = React.useState<HTMLDivElement | null>(null);
	const {styles, attributes} = usePopper(buttonEl, menuEl);

	return (
		<>
			<span className="dropdown-button">
				<IconButton {...otherProps} ref={setButtonEl} />
			</span>
			{open && (
				<div
					className="dropdown-button-menu"
					ref={setMenuEl}
					style={styles.popper}
					{...attributes.popper}
				>
					{children}
				</div>
			)}
		</>
	);
};
