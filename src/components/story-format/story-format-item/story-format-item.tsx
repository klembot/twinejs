import {IconAlertTriangle, IconStar, IconTrash} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {formatImageUrl, StoryFormat} from '../../../store/story-formats';
import {Badge} from '../../badge/badge';
import {IconLoading} from '../../image/icon';
import {StoryFormatItemDetails} from './story-format-item-details';
import './story-format-item.css';
import {CheckboxButton} from '../../control/checkbox-button';
import {IconButton} from '../../control/icon-button';
import classNames from 'classnames';

export interface StoryFormatItemProps {
	defaultFormat: boolean;
	editorExtensionsDisabled: boolean;
	format: StoryFormat;
	onChangeEditorExtensionsDisabled: (value: boolean) => void;
	onDelete: () => void;
	onUseAsDefault: () => void;
	onUseAsProofing: () => void;
	proofingFormat: boolean;
}

export const StoryFormatItem: React.FC<StoryFormatItemProps> = props => {
	const {
		defaultFormat,
		editorExtensionsDisabled,
		format,
		onChangeEditorExtensionsDisabled,
		onDelete,
		onUseAsDefault,
		onUseAsProofing,
		proofingFormat
	} = props;
	const {t} = useTranslation();

	let image = <></>;

	if (format.loadState === 'error') {
		image = <IconAlertTriangle />;
	} else if (
		format.loadState === 'unloaded' ||
		format.loadState === 'loading'
	) {
		image = <IconLoading />;
	} else if (format.loadState === 'loaded' && format.properties.image) {
		image = <img src={formatImageUrl(format)} alt="" />;
	}

	let useButton = <></>;

	if (format.loadState === 'loaded') {
		if (format.properties.proofing) {
			useButton = (
				<IconButton
					disabled={proofingFormat}
					icon={<IconStar />}
					label={t('components.storyFormatItem.useProofingFormat')}
					onClick={onUseAsProofing}
					variant="primary"
				/>
			);
		} else {
			useButton = (
				<IconButton
					disabled={defaultFormat}
					label={t('components.storyFormatItem.useFormat')}
					onClick={onUseAsDefault}
					icon={<IconStar />}
					variant="primary"
				/>
			);
		}
	}

	return (
		<div
			className={classNames('story-format-item', {
				highlighted: defaultFormat || proofingFormat
			})}
		>
			<div className="story-format-image">{image}</div>
			<div className="story-format-text">
				<div className="story-format-name">
					<h3>
						{t('components.storyFormatItem.name', {
							name: format.name,
							version: format.version
						})}
					</h3>
					{!format.userAdded && (
						<Badge label={t('components.storyFormatItem.builtIn')} />
					)}
					{format.loadState === 'loaded' && format.properties.proofing && (
						<Badge label={t('components.storyFormatItem.proofing')} />
					)}
					{defaultFormat && (
						<Badge label={t('components.storyFormatItem.defaultFormat')} />
					)}
					{proofingFormat && (
						<Badge label={t('components.storyFormatItem.proofingFormat')} />
					)}
				</div>
				<StoryFormatItemDetails format={format} />
			</div>
			<div className="actions">
				{useButton}
				{format.userAdded && (
					<IconButton
						label={t('common.delete')}
						icon={<IconTrash />}
						onClick={onDelete}
					/>
				)}
				{format.loadState === 'loaded' && !format.properties.proofing && (
					<CheckboxButton
						label={t('components.storyFormatItem.useEditorExtensions')}
						onChange={value => onChangeEditorExtensionsDisabled(!value)}
						value={!editorExtensionsDisabled}
					/>
				)}
			</div>
		</div>
	);
};
