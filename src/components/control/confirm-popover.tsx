import * as React from 'react';
import {CardButton} from './card-button';
import {CardContent} from '../container/card';
import {ButtonBar} from '../container/button-bar';
import {IconButton} from './icon-button';
import './confirm-popover.css';

export interface ConfirmPopoverProps {
	open: boolean;
	onChangeOpen: (open: boolean) => void;
	message: string;
	confirmLabel: string;
	cancelLabel: string;
	confirmIcon?: React.ReactNode;
	onConfirm: () => void;
}

export const ConfirmPopover: React.FC<ConfirmPopoverProps> = props => {
	const {open, onChangeOpen, message, confirmLabel, cancelLabel, confirmIcon, onConfirm} = props;

	function handleConfirm(e: React.MouseEvent) {
		e.preventDefault();
		onConfirm();
		onChangeOpen(false);
	}

	function handleCancel(e: React.MouseEvent) {
		e.preventDefault();
		onChangeOpen(false);
	}

	return (
		<CardButton
			ariaLabel={confirmLabel}
			open={open}
			onChangeOpen={onChangeOpen}
			icon={confirmIcon}
			label={confirmLabel}
			variant="danger"
		>
			<form>
				<CardContent>
					<div className="confirm-popover-message">{message}</div>
				</CardContent>
				<ButtonBar>
					<IconButton
						buttonType="button"
						icon={confirmIcon}
						label={confirmLabel}
						variant="danger"
						onClick={handleConfirm}
					/>
					<IconButton
						buttonType="button"
						icon={<span style={{fontWeight: 'bold'}}>×</span>}
						label={cancelLabel}
						variant="secondary"
						onClick={handleCancel}
					/>
				</ButtonBar>
			</form>
		</CardButton>
	);
};
