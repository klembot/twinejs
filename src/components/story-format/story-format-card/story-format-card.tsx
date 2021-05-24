import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconAlertTriangle, IconTrash} from '@tabler/icons';
import {ButtonBar} from '../../container/button-bar';
import {CheckboxButton} from '../../control/checkbox-button';
import {Card, CardContent} from '../../container/card';
import {IconButton} from '../../control/icon-button';
import {IconLoading} from '../../image/icon';
import {formatImageUrl, StoryFormat} from '../../../store/story-formats';
import {StoryFormatCardDetails} from './story-format-card-details';
import './story-format-card.css';

export interface StoryFormatCardProps {
	format: StoryFormat;
	onDelete: () => void;
	onSelect: () => void;
	selected: boolean;
}

export const StoryFormatCard: React.FC<StoryFormatCardProps> = props => {
	const {format, onDelete, onSelect, selected} = props;
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

	return (
		<div className="story-format-card">
			<Card selected={selected}>
				<CardContent>
					<div className="story-format-image">{image}</div>
					<div className="story-format-description">
						<h2>
							{t('components.storyFormatCard.name', {
								name: format.name,
								version: format.version
							})}
						</h2>
						<StoryFormatCardDetails format={format} />
					</div>
				</CardContent>
				<ButtonBar>
					{format.loadState === 'loaded' && (
						<CheckboxButton
							disabled={selected}
							label={
								format.properties?.proofing
									? t('components.storyFormatCard.useProofingFormat')
									: t('components.storyFormatCard.useFormat')
							}
							onChange={onSelect}
							value={selected}
							variant="primary"
						/>
					)}
					{format.userAdded && (
						<IconButton icon={<IconTrash />} label={t('common.delete')} />
					)}
				</ButtonBar>
			</Card>
		</div>
	);
};
