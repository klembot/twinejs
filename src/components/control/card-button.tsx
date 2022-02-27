import * as React from 'react';
import {usePopper} from 'react-popper';
import {CSSTransition} from 'react-transition-group';
import {Card} from '../container/card';
import {IconButton, IconButtonProps} from './icon-button';
import './card-button.css';

export interface CardButtonProps extends Omit<IconButtonProps, 'onClick'> {
	/**
	 * ARIA label for the card that opens.
	 */
	ariaLabel: string;
	/**
	 * CSS selector for the element inside the card that should be focused when it
	 * is opened. Otherwise, the first text input or button in source order will
	 * be focused.
	 */
	focusSelector?: string;
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
	const {ariaLabel, children, focusSelector, onChangeOpen, open, ...other} =
		props;
	const [buttonEl, setButtonEl] = React.useState<HTMLButtonElement | null>(
		null
	);
	const [cardEl, setCardEl] = React.useState<HTMLDivElement | null>(null);
	const [previousFocusEl, setPreviousFocusEl] =
		React.useState<HTMLElement | null>(null);
	const {styles, attributes} = usePopper(buttonEl, cardEl, {strategy: 'fixed'});

	// Move focus inside the card when it's opened.

	React.useEffect(() => {
		if (open && cardEl) {
			setPreviousFocusEl(document.activeElement as HTMLElement | null);

			// Use the focusSelector prop if that was specified;

			if (focusSelector) {
				const focusEl = cardEl.querySelector<HTMLElement>(focusSelector);

				if (focusEl) {
					// Select it if possible--e.g it's a text field.

					if (typeof (focusEl as any).select === 'function') {
						(focusEl as any).select();
					}

					focusEl.focus();
					return;
				}
			}

			// Prefer a text input if one's available.

			const input =
				cardEl.querySelector<HTMLInputElement>('input[type="text"]');

			if (input) {
				input.select();
				input.focus();
				return;
			}

			// Otherwise, choose the first button.

			const button = cardEl.querySelector<HTMLButtonElement>('button');

			if (button) {
				button.focus();
			}

			// If neither is available, we've messed up--there needs to be at least
			// one focusable element.
		}
	}, [cardEl, focusSelector, open]);

	// Close an opened card if a click event occurs outside it.

	React.useEffect(() => {
		const closer = (event: MouseEvent) => {
			let target: Node | null = event.target as HTMLElement;

			while (target && target !== cardEl) {
				target = target.parentNode;
			}

			if (target !== cardEl) {
				onChangeOpen(false);
			}
		};

		if (open) {
			document.addEventListener('click', closer);
			return () => document.removeEventListener('click', closer);
		}
	}, [cardEl, onChangeOpen, open, props]);

	// Restore focus when the card is closed.

	React.useEffect(() => {
		if (!open && previousFocusEl) {
			previousFocusEl.focus();
			setPreviousFocusEl(null);
		}
	}, [open, previousFocusEl]);

	return (
		<span className="card-button">
			<IconButton
				{...other}
				onClick={() => onChangeOpen(!open)}
				ref={setButtonEl}
			/>
			<CSSTransition
				classNames="fade-out"
				in={open}
				mountOnEnter
				timeout={200}
				unmountOnExit
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
			</CSSTransition>
		</span>
	);
};
