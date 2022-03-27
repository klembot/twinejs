import classNames from 'classnames';
import * as React from 'react';
import {Card, CardProps} from './card';
import './selectable-card.css';

export interface SelectableCardProps extends CardProps {
	label: string;
	onDoubleClick?: React.MouseEventHandler;
	onSelect: (value: boolean, exclusive: boolean) => void;
	selected?: boolean;
}

export const SelectableCard: React.FC<SelectableCardProps> = props => {
	const {label, onDoubleClick, onSelect, selected, ...other} = props;
	const onClick = React.useCallback(
		(event: React.MouseEvent) => {
			if (event.ctrlKey || event.shiftKey) {
				onSelect(!selected, false);
			} else {
				onSelect(true, true);
			}
		},
		[onSelect, selected]
	);
	const onKeyDown = React.useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === ' ' || event.key === 'Enter') {
				event.preventDefault();

				if (event.ctrlKey || event.shiftKey) {
					onSelect(!selected, false);
				} else {
					onSelect(true, true);
				}
			}
		},
		[onSelect, selected]
	);

	return (
		<div
			className={classNames('selectable-card', {selected})}
			role="button"
			aria-label={label}
			aria-pressed={selected}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
			onKeyDown={onKeyDown}
			tabIndex={0}
		>
			<Card {...other} />
		</div>
	);
};
