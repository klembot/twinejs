import * as React from 'react';
import ReactModal, {Props as ReactModalProps} from 'react-modal';
import './modal.css';

export type ModalProps = ReactModalProps;

export const Modal: React.FC<ModalProps> = props => {
	const {children, ...otherProps} = props;
	return (
		<ReactModal
			appElement={document.getElementById('root') ?? undefined}
			className="modal"
			overlayClassName="modal-overlay"
			{...otherProps}
		>
			<div className="modal-content">{children}</div>
		</ReactModal>
	);
};
