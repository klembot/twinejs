import * as React from 'react';
import {usePopper} from 'react-popper';
import {CSSTransition} from 'react-transition-group';
import {IconCheck} from '@tabler/icons';
import {ButtonBar, ButtonBarSeparator} from '../container/button-bar';
import {ButtonCard} from '../container/button-card';
import {IconEmpty} from '../image/icon';
import {IconButton, IconButtonProps} from './icon-button';
import './menu-button.css';

export interface LabeledMenuItem {
	checked?: boolean;
	disabled?: boolean;
	label: string;
	onClick: () => void;
	separator?: undefined;
	variant?: IconButtonProps['variant'];
}

export interface MenuSeparator {
	separator: true;
}

export interface MenuButtonProps extends Omit<IconButtonProps, 'onClick'> {
	items: (LabeledMenuItem | MenuSeparator)[];
}

export const MenuButton: React.FC<MenuButtonProps> = props => {
	const {items, ...other} = props;
	const [buttonEl, setButtonEl] = React.useState<HTMLButtonElement | null>(
		null
	);
	const [menuEl, setMenuEl] = React.useState<HTMLDivElement | null>(null);
	const [open, setOpen] = React.useState(false);
	const {styles, attributes} = usePopper(buttonEl, menuEl, {strategy: 'fixed'});

	React.useEffect(() => {
		const closer = () => setOpen(false);

		if (open) {
			document.addEventListener('click', closer);
		}

		return () => document.removeEventListener('click', closer);
	}, [menuEl, open, setOpen]);

	return (
		<span className="menu-button">
			<IconButton
				{...other}
				onClick={() => setOpen(open => !open)}
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
					className="menu-button-menu"
					ref={setMenuEl}
					style={styles.popper}
					{...attributes.popper}
				>
					<ButtonCard floating>
						<ButtonBar orientation="vertical">
							{items.map((item, index) => {
								if (item.separator) {
									return <ButtonBarSeparator key={index} />;
								}

								return (
									<IconButton
										disabled={item.disabled}
										icon={item.checked ? <IconCheck /> : <IconEmpty />}
										key={index}
										label={item.label}
										onClick={item.onClick}
										variant={item.variant}
									/>
								);
							})}
						</ButtonBar>
					</ButtonCard>
				</div>
			</CSSTransition>
		</span>
	);
};
