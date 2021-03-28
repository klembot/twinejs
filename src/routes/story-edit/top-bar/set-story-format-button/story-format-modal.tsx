import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {
	Card,
	CardActions,
	CardBody,
	CardHeader
} from '../../../../components/container/card';
import {IconButton} from '../../../../components/control/icon-button';
import {
	TextSelect,
	TextSelectProps
} from '../../../../components/control/text-select';
import {Modal, ModalProps} from '../../../../components/modal/modal';
import {FormatLoader} from '../../../../store/format-loader';
import {
	StoryFormat,
	useStoryFormatsContext
} from '../../../../store/story-formats';

export interface StoryFormatModalProps extends ModalProps {
	onCancel?: () => void;
	onChange?: TextSelectProps['onChange'];
	onSubmit?: () => void;
	message: string;
	value?: StoryFormat;
}

export const StoryFormatModal: React.FC<StoryFormatModalProps> = props => {
	const {message, onCancel, onChange, onSubmit, value, ...otherProps} = props;
	const {formats} = useStoryFormatsContext();
	const {t} = useTranslation();

	const availableFormats = React.useMemo(
		() =>
			formats.filter(
				format =>
					format.loadState === 'loaded' && !format.properties.proofing
			),
		[formats]
	);

	return (
		<Modal {...otherProps}>
			<Card>
				<CardHeader>{message}</CardHeader>
				<FormatLoader block>
					<CardBody>
						<TextSelect
							options={availableFormats.map(format => ({
								label: `${format.name} ${format.version}`,
								value: format.id
							}))}
							onChange={onChange}
							value={value ? value.id : ''}
						/>
					</CardBody>
					<CardActions>
						<IconButton
							icon="x"
							label={t('common.cancel')}
							onClick={onCancel}
						/>
						<IconButton
							buttonType="submit"
							icon="check"
							label={t('common.ok')}
							onClick={onSubmit}
							variant="primary"
						/>
					</CardActions>
				</FormatLoader>
			</Card>
		</Modal>
	);
};
