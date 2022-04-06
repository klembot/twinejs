import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {Story} from '../../store/stories';
import {Color} from '../../util/color';
import {CardContent, CardProps} from '../container/card';
import {SelectableCard} from '../container/card/selectable-card';
import {TagButton} from '../tag';
import './story-card.css';
import {StoryPreview} from './story-preview';

const dateFormatter = new Intl.DateTimeFormat([]);

export interface StoryCardProps extends CardProps {
	onChangeTagColor: (name: string, color: Color) => void;
	onRemoveTag: (name: string) => void;
	onEdit: () => void;
	onSelect: () => void;
	story: Story;
	storyTagColors: Record<string, Color>;
}

export const StoryCard: React.FC<StoryCardProps> = props => {
	const {
		onChangeTagColor,
		onEdit,
		onRemoveTag,
		onSelect,
		story,
		storyTagColors,
		...otherProps
	} = props;
	const {t} = useTranslation();

	return (
		<div className="story-card">
			<SelectableCard
				{...otherProps}
				label={story.name}
				onDoubleClick={onEdit}
				onSelect={onSelect}
				selected={story.selected}
			>
				<CardContent>
					<div className="story-card-summary">
						<div className="story-card-summary-preview">
							<StoryPreview story={story} />
						</div>
						<div className="story-card-summary-text">
							<h2>{story.name}</h2>
							<p>
								{t('components.storyCard.lastUpdated', {
									date: dateFormatter.format(story.lastUpdate)
								})}
								<br />
								{t('components.storyCard.passageCount', {
									count: story.passages.length
								})}
							</p>
						</div>
					</div>
					{story.tags && (
						<div className="tags">
							{story.tags.map(tag => (
								<TagButton
									color={storyTagColors[tag]}
									key={tag}
									name={tag}
									onChangeColor={color => onChangeTagColor(tag, color)}
									onRemove={() => onRemoveTag(tag)}
								/>
							))}
						</div>
					)}
				</CardContent>
			</SelectableCard>
		</div>
	);
};
