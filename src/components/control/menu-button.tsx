import * as React from 'react';
import {usePopper} from 'react-popper';
import {CSSTransition} from 'react-transition-group';
import {ButtonBar, ButtonBarSeparator} from '../container/button-bar';
import {ButtonCard} from '../container/button-card';
import {IconEmpty} from '../image/icon';
import {IconButton, IconButtonProps} from './icon-button';
import './menu-button.css';
import {CheckboxButton} from './checkbox-button';
import {IconCheck} from '@tabler/icons';
import {useControlledOpen} from './use-controlled-open';

export interface UncheckableLabeledMenuItem {
	disabled?: boolean;
	label: string;
	onClick: () => void;
	separator?: undefined;
	variant?: IconButtonProps['variant'];
}

export interface CheckableLabeledMenuItem extends UncheckableLabeledMenuItem {
	checkable: true;
	checked: boolean;
}

export type LabeledMenuItem =
	| UncheckableLabeledMenuItem
	| CheckableLabeledMenuItem;

export interface MenuSeparator {
	separator: true;
}

export interface MenuButtonProps extends Omit<IconButtonProps, 'onClick'> {
	items: (LabeledMenuItem | MenuSeparator)[];
	/**
	 * Called when the menu opens or closes. Only needed if a parent wants to
	 * control this--see `open`.
	 */
	onChangeOpen?: (value: boolean) => void;
	/**
	 * Is the menu open? Leave undefined to let the button manage itself.
	 * Setting it lets a parent open the menu programmatically, e.g. from a
	 * keyboard shortcut.
	 */
	open?: boolean;
}

export const MenuButton: React.FC<MenuButtonProps> = props => {
	const {items, onChangeOpen, open: controlledOpen, ...other} = props;
	const [buttonEl, setButtonEl] = React.useState<HTMLButtonElement | null>(
		null
	);
	const [menuEl, setMenuEl] = React.useState<HTMLDivElement | null>(null);
	const [open, setOpen] = useControlledOpen(controlledOpen, onChangeOpen);
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
				onClick={() => setOpen(!open)}
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

								return 'checkable' in item ? (
									<CheckboxButton
										checkedIcon={<IconCheck />}
										disabled={item.disabled}
										key={index}
										label={item.label}
										onChange={item.onClick}
										uncheckedIcon={<IconEmpty />}
										value={item.checked}
									/>
								) : (
									<IconButton
										disabled={item.disabled}
										icon={<IconEmpty />}
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
