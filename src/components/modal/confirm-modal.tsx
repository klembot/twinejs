import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconCheck, IconX} from '@tabler/icons';
import {Card, CardFooter, CardBody, CardHeader} from '../container/card';
import {IconButton, IconButtonProps} from '../control/icon-button';
import {Modal, ModalProps} from './modal';
import './confirm-modal.css';

export interface ConfirmModalProps extends ModalProps {
	cancelButtonProps?: Partial<IconButtonProps>;
	confirmButtonProps?: Partial<IconButtonProps>;
	detail?: string;
	domId: string;
	message: string;
	onCancel: () => void;
	onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = props => {
	const {
		cancelButtonProps,
		confirmButtonProps,
		detail,
		domId,
		message,
		onCancel,
		onConfirm,
		...otherProps
	} = props;
	const {t} = useTranslation();

	return (
		<Modal {...otherProps}>
			<div className="confirm-modal">
				<Card>
					<CardHeader>{message}</CardHeader>
					<CardBody>{detail}</CardBody>
					<CardFooter>
						<IconButton
							icon={<IconX />}
							label={t('common.cancel')}
							onClick={onCancel}
							{...cancelButtonProps}
						/>
						<IconButton
							icon={<IconCheck />}
							label={t('common.ok')}
							onClick={onConfirm}
							{...confirmButtonProps}
						/>
					</CardFooter>
				</Card>
			</div>
		</Modal>
	);
};
