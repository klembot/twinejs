import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconAlertTriangle} from '@tabler/icons';
import {CardBody, CardHeader} from '../../container/card';
import {ImageCard} from '../../container/image-card';
import {IconButton} from '../../control/icon-button';
import {IconLoading} from '../../image/icon';
import {formatImageUrl, StoryFormat} from '../../../store/story-formats';
import {StoryFormatCardActions} from './story-format-card-actions';
import {StoryFormatCardDetails} from './story-format-card-details';
import './story-format-card.css';

export interface StoryFormatCardProps {
	format: StoryFormat;
	onDelete: () => void;
	onSelect: () => void;
	selected: boolean;
	selectedText?: string;
	selectIcon?: string;
	selectLabel?: string;
}

export const StoryFormatCard: React.FC<StoryFormatCardProps> = props => {
	const {format, onDelete, onSelect, selected, selectIcon, selectLabel} = props;
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
			<ImageCard image={image} selected={selected}>
				<CardHeader>
					{t('components.storyFormatCard.name', {
						name: format.name,
						version: format.version
					})}
				</CardHeader>
				<CardBody>
					<StoryFormatCardDetails format={format} />
				</CardBody>
				<StoryFormatCardActions
					format={format}
					onSelect={onSelect}
					selected={selected}
				/>
			</ImageCard>
		</div>
	);
};
