import {IconCheck, IconX} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {ButtonBar} from '../container/button-bar';
import {CardContent} from '../container/card';
import {CardButton, CardButtonProps} from './card-button';
import {IconButton, IconButtonProps} from './icon-button';
import {useControlledOpen} from './use-controlled-open';
import './confirm-button.css';

export interface ConfirmButtonProps
	extends Omit<CardButtonProps, 'ariaLabel' | 'open' | 'onChangeOpen'> {
	cancelIcon?: React.ReactNode;
	cancelLabel?: string;
	confirmIcon?: React.ReactNode;
	confirmLabel?: string;
	confirmVariant?: IconButtonProps['variant'];
	/**
	 * Called when the confirmation opens or closes. Only needed if a parent
	 * wants to control this--see `open`.
	 */
	onChangeOpen?: (value: boolean) => void;
	onConfirm: () => void;
	/**
	 * Is the confirmation open? Leave undefined to let the button manage
	 * itself. Setting it lets a parent open the confirmation programmatically,
	 * e.g. from a keyboard shortcut.
	 */
	open?: boolean;
	prompt: string;
}

export const ConfirmButton: React.FC<ConfirmButtonProps> = props => {
	const {
		cancelIcon,
		cancelLabel,
		confirmIcon,
		confirmLabel,
		confirmVariant,
		onChangeOpen,
		onConfirm,
		open: controlledOpen,
		prompt,
		...other
	} = props;
	const [open, setOpen] = useControlledOpen(controlledOpen, onChangeOpen);
	const {t} = useTranslation();

	function handleConfirm() {
		setOpen(false);
		onConfirm();
	}

	return (
		<span className="confirm-button">
			<CardButton
				ariaLabel={prompt}
				onChangeOpen={setOpen}
				open={open}
				{...other}
			>
				<div>
					<CardContent>{prompt}</CardContent>
					<ButtonBar>
						<IconButton
							icon={confirmIcon ?? <IconCheck />}
							label={confirmLabel ?? t('common.ok')}
							onClick={handleConfirm}
							variant={confirmVariant ?? 'primary'}
						/>
						<IconButton
							icon={cancelIcon ?? <IconX />}
							label={cancelLabel ?? t('common.cancel')}
							onClick={() => setOpen(false)}
						/>
					</ButtonBar>
				</div>
			</CardButton>
		</span>
	);
};
