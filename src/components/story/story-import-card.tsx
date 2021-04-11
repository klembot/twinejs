import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {CardFooter, CardBody, CardHeader, CardProps} from '../container/card';
import {ImageCard} from '../container/image-card';
import {CheckboxButton} from '../control/checkbox-button';
import {StoryPreview} from './story-preview';
import {Story} from '../../store/stories';
import './story-card.css';

// TODO: can we generalize?

const dateFormatter = new Intl.DateTimeFormat([]);

export interface StoryImportCardProps extends CardProps {
	onChangeSelect: (value: boolean) => void;
	selected: boolean;
	story: Story;
}

export const StoryImportCard: React.FC<StoryImportCardProps> = props => {
	const {onChangeSelect, selected, story, ...otherProps} = props;
	const {t} = useTranslation();

	return (
		<div className="story-import-card">
			<ImageCard
				selected={selected}
				image={<StoryPreview story={story} />}
				{...otherProps}
			>
				<CardHeader>{story.name}</CardHeader>
				<CardBody>
					<p>
						{t('components.storyCard.lastUpdated', {
							date: dateFormatter.format(story.lastUpdate)
						})}
						<br />
						{t('components.storyCard.passageCount', {
							count: story.passages.length
						})}
					</p>
				</CardBody>
				<CardFooter>
					<CheckboxButton
						label={t('storyImport.importThisStory')}
						onChange={() => onChangeSelect(!selected)}
						value={selected}
						variant="primary"
					/>
				</CardFooter>
			</ImageCard>
		</div>
	);
};
