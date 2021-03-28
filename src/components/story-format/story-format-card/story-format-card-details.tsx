import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {StoryFormat} from '../../../store/story-formats';

export interface StoryFormatCardDetailsProps {
	format: StoryFormat;
}

export const StoryFormatCardDetails: React.FC<StoryFormatCardDetailsProps> = ({
	format
}) => {
	const {t} = useTranslation();

	if (format.loadState !== 'loaded') {
		return <div className="story-format-card-details"></div>;
	}

	return (
		<div className="story-format-card-details">
			{format.properties.author && (
				<p className="story-format-card-author">
					{t('components.storyFormatCard.author', {
						author: format.properties.author
					})}
				</p>
			)}
			{format.properties.description && (
				<div
					className="story-format-card-description"
					dangerouslySetInnerHTML={{
						__html: format.properties.description
					}}
				/>
			)}
			{format.properties.license && (
				<p className="story-format-card-license">
					{t('components.storyFormatCard.license', {
						license: format.properties.license
					})}
				</p>
			)}
		</div>
	);
};
