import {IconCheck, IconX} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {ButtonBar} from '../container/button-bar';
import {CardContent} from '../container/card';
import {CardButton, CardButtonProps} from './card-button';
import {IconButton, IconButtonProps} from './icon-button';
import './confirm-button.css';

export interface ConfirmButtonProps
	extends Omit<CardButtonProps, 'open' | 'onChangeOpen'> {
	cancelIcon?: React.ReactNode;
	cancelLabel?: string;
	confirmIcon?: React.ReactNode;
	confirmLabel?: string;
	confirmVariant?: IconButtonProps['variant'];
	onConfirm: () => void;
	prompt: string;
}

export const ConfirmButton: React.FC<ConfirmButtonProps> = props => {
	const {
		cancelIcon,
		cancelLabel,
		confirmIcon,
		confirmLabel,
		confirmVariant,
		onConfirm,
		prompt,
		...other
	} = props;
	const [open, setOpen] = React.useState(false);
	const {t} = useTranslation();

	return (
		<span className="confirm-button">
			<CardButton onChangeOpen={setOpen} open={open} {...other}>
				<CardContent>{prompt}</CardContent>
				<ButtonBar>
					<IconButton
						icon={confirmIcon ?? <IconCheck />}
						label={confirmLabel ?? t('common.ok')}
						onClick={onConfirm}
						variant={confirmVariant ?? 'primary'}
					/>
					<IconButton
						icon={cancelIcon ?? <IconX />}
						label={cancelLabel ?? t('common.cancel')}
						onClick={() => setOpen(false)}
					/>
				</ButtonBar>
			</CardButton>
		</span>
	);
};
