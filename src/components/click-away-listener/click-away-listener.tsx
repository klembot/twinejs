import * as React from 'react';
import 'element-closest';

export interface ClickAwayListenerProps {
	ignoreSelector?: string;
	onClickAway: () => void;
}

export const ClickAwayListener: React.FC<ClickAwayListenerProps> = props => {
	const {children, ignoreSelector, onClickAway} = props;
	const handleClick: React.MouseEventHandler = event => {
		if (ignoreSelector) {
			if (!(event.target as HTMLElement)?.closest(ignoreSelector)) {
				onClickAway();
			}
		} else {
			onClickAway();
		}
	};

	return <div onClick={handleClick}>{children}</div>;
};
