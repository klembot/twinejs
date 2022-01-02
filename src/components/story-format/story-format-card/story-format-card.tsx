import {IconAlertTriangle} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {formatImageUrl, StoryFormat} from '../../../store/story-formats';
import {Badge} from '../../badge/badge';
import {Card, CardContent} from '../../container/card';
import {IconLoading} from '../../image/icon';
import {StoryFormatCardDetails} from './story-format-card-details';
import './story-format-card.css';

export interface StoryFormatCardProps {
	defaultFormat: boolean;
	editorExtensionsDisabled: boolean;
	format: StoryFormat;
	onSelect: () => void;
}

export const StoryFormatCard: React.FC<StoryFormatCardProps> = props => {
	const {defaultFormat, editorExtensionsDisabled, format, onSelect} = props;
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
		<div className="story-format-card" onClick={onSelect}>
			<Card selected={format.selected}>
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
					<div className="story-format-badges">
						{!format.userAdded && (
							<Badge label={t('components.storyFormatCard.builtIn')} />
						)}
						{defaultFormat && (
							<Badge label={t('components.storyFormatCard.defaultFormat')} />
						)}
						{editorExtensionsDisabled && (
							<Badge
								label={t('components.storyFormatCard.editorExtensionsDisabled')}
							/>
						)}
						{format.loadState === 'loaded' && format.properties.proofing && (
							<Badge label={t('components.storyFormatCard.proofing')} />
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
