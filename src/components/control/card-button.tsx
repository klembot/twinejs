import * as React from 'react';
import {usePopper} from 'react-popper';
import {CSSTransition} from 'react-transition-group';
import {Card} from '../container/card';
import {IconButton, IconButtonProps} from './icon-button';
import './card-button.css';
import FocusTrap from 'focus-trap-react';

export interface CardButtonProps extends IconButtonProps {
	/**
	 * ARIA label for the card that opens.
	 */
	ariaLabel: string;
	/**
	 * Callback for when the open status of the card should change.
	 */
	onChangeOpen: (value: boolean) => void;
	/**
	 * Is the card currently open?
	 */
	open?: boolean;
}

export const CardButton: React.FC<CardButtonProps> = props => {
	const {ariaLabel, children, onChangeOpen, open, ...other} = props;
	const [buttonEl, setButtonEl] = React.useState<HTMLButtonElement | null>(
		null
	);
	const [cardEl, setCardEl] = React.useState<HTMLDivElement | null>(null);
	const {styles, attributes} = usePopper(buttonEl, cardEl, {strategy: 'fixed'});

	function filterEventsOutsideFocusTrap(event: MouseEvent | TouchEvent) {
		const narrowedTarget = event.target as HTMLElement;

		if (narrowedTarget === buttonEl || buttonEl?.contains(narrowedTarget)) {
			// Special handling because if we allow the click to go through,
			// onChangeOpen is called twice in a row--first by the deactivate handler
			// on the focus trap and then by the click handler on the button. In this
			// case, we block the deactivation and manually handle the click
			// ourselves.

			onChangeOpen(false);
			return false;
		}

		return true;
	}

	return (
		<span className="card-button">
			<IconButton
				onClick={() => onChangeOpen(!open)}
				{...other}
				ref={setButtonEl}
			/>
			<CSSTransition
				classNames="fade-out"
				in={open}
				mountOnEnter
				timeout={200}
				unmountOnExit
			>
				<FocusTrap
					focusTrapOptions={{
						clickOutsideDeactivates: filterEventsOutsideFocusTrap,
						onDeactivate: () => onChangeOpen(false)
					}}
				>
					<div
						aria-label={ariaLabel}
						className="card-button-card"
						ref={setCardEl}
						role="dialog"
						style={styles.popper}
						{...attributes.popper}
					>
						<Card floating>{children}</Card>
					</div>
				</FocusTrap>
			</CSSTransition>
		</span>
	);
};
