import * as React from 'react';
import {Flag, FlagProps} from '../image/flag/flag';
import './flag-button.css';

export interface FlagButtonProps extends FlagProps {
	onClick: () => void;
}

export const FlagButton: React.FC<FlagButtonProps> = props => {
	const {label, onClick, ...otherProps} = props;

	return (
		<button className="flag-button" onClick={onClick}>
			<Flag {...otherProps} />
			{label}
		</button>
	);
};
