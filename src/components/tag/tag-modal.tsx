import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconCheck, IconX} from '@tabler/icons';
import {ButtonBar} from '../container/button-bar';
import {Card, CardContent} from '../container/card';
import {ColorSelect} from '../control/color-select';
import {IconButton} from '../control/icon-button';
import {TextInput} from '../control/text-input';
import {Modal, ModalProps} from '../modal/modal';
import {Color} from '../../util/color';
import './tag-modal.css';

export interface TagModalProps extends ModalProps {
	color: Color;
	detail?: string;
	message: string;
	name: string;
	onCancel: () => void;
	onChangeColor: (value: Color) => void;
	onChangeName: (value: string) => void;
	onSubmit: () => void;
}

// TODO: name input goes outside modal

export const TagModal: React.FC<TagModalProps> = props => {
	const {
		color,
		detail,
		message,
		name,
		onCancel,
		onChangeColor,
		onChangeName,
		onSubmit,
		...otherProps
	} = props;
	const {t} = useTranslation();

	return (
		<Modal {...otherProps}>
			<div className="tag-modal">
				<Card>
					<h2>{message}</h2>
					<CardContent>
						<p>{detail}</p>
						<div className="controls">
							<TextInput
								onChange={e => onChangeName(e.target.value)}
								value={name}
							>
								{t('common.name')}
							</TextInput>
							<ColorSelect
								label={t('common.color')}
								onChange={onChangeColor}
								value={color}
							/>
						</div>
					</CardContent>
					<ButtonBar>
						<IconButton
							icon={<IconX />}
							label={t('common.cancel')}
							onClick={onCancel}
						/>
						<IconButton
							icon={<IconCheck />}
							label={t('common.save')}
							onClick={onSubmit}
							variant="primary"
						/>
					</ButtonBar>
				</Card>
			</div>
		</Modal>
	);
};
