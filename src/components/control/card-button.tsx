import * as React from 'react';
import {usePopper} from 'react-popper';
import {CSSTransition} from 'react-transition-group';
import {Card} from '../container/card';
import {IconButton, IconButtonProps} from './icon-button';
import './card-button.css';

export interface CardButtonProps extends Omit<IconButtonProps, 'onClick'> {
	onChangeOpen: (value: boolean) => void;
	open?: boolean;
}

export const CardButton: React.FC<CardButtonProps> = props => {
	const {children, onChangeOpen, open, ...other} = props;
	const [buttonEl, setButtonEl] = React.useState<HTMLButtonElement | null>(
		null
	);
	const [cardEl, setCardEl] = React.useState<HTMLDivElement | null>(null);
	const {styles, attributes} = usePopper(buttonEl, cardEl, {strategy: 'fixed'});

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
					className="card-button-card"
					ref={setCardEl}
					style={styles.popper}
					{...attributes.popper}
				>
					<Card floating>{children}</Card>
				</div>
			</CSSTransition>
		</span>
	);
};
