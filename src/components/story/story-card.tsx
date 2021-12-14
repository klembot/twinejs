import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconDots, IconEdit, IconTrash} from '@tabler/icons';
import {Card, CardContent, CardProps} from '../container/card';
import {ButtonBar} from '../container/button-bar';
import {MenuButton} from '../control/menu-button';
import {IconButton} from '../control/icon-button';
import {RenameStoryButton} from './rename-story-button';
import {AddTagButton, TagButton} from '../tag';
import {StoryPreview} from './story-preview';
import {storyTags, Story} from '../../store/stories';
import {Color} from '../../util/color';
import './story-card.css';
import {hueString} from '../../util/hue-string';
import {ConfirmButton} from '../control/confirm-button';
import {isElectronRenderer} from '../../util/is-electron';

const dateFormatter = new Intl.DateTimeFormat([]);

export interface StoryCardProps extends CardProps {
	allStories: Story[];
	onDelete: () => void;
	onDuplicate: () => void;
	onAddTag: (name: string, color?: Color) => void;
	onChangeTagColor: (name: string, color: Color) => void;
	onRemoveTag: (name: string) => void;
	onEdit: () => void;
	onPlay: () => void;
	onPublish: () => void;
	onRename: (name: string) => void;
	onTest: () => void;
	story: Story;
	storyTagColors: Record<string, Color>;
}

export const StoryCard: React.FC<StoryCardProps> = props => {
	const {
		allStories,
		onAddTag,
		onChangeTagColor,
		onDelete,
		onDuplicate,
		onEdit,
		onPlay,
		onPublish,
		onRemoveTag,
		onRename,
		onTest,
		story,
		storyTagColors,
		...otherProps
	} = props;
	const {t} = useTranslation();

	const previewStyle = {
		backgroundColor: `hsla(${hueString(story.name)}, 90%, 75%, 0.2)`
	};

	return (
		<div className="story-card">
			<Card {...otherProps}>
				<CardContent>
					<div className="story-card-summary">
						<div className="story-card-summary-preview" style={previewStyle}>
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
				<ButtonBar>
					<IconButton
						icon={<IconEdit />}
						label={t('common.edit')}
						onClick={onEdit}
						variant="primary"
					/>
					<RenameStoryButton
						existingStories={allStories}
						onRename={onRename}
						story={story}
					/>
					<AddTagButton
						assignedTags={story.tags}
						existingTags={storyTags(allStories)}
						onAdd={onAddTag}
					/>
					<ConfirmButton
						confirmIcon={<IconTrash />}
						confirmLabel={t('common.delete')}
						confirmVariant="danger"
						icon={<IconTrash />}
						label={t('common.delete')}
						onConfirm={onDelete}
						prompt={t(
							`components.storyCard.deleteStoryWarning.${
								isElectronRenderer() ? 'electron' : 'web'
							}`,
							{storyName: story.name}
						)}
					/>
					<MenuButton
						icon={<IconDots />}
						items={[
							{
								label: t('common.play'),
								onClick: onPlay
							},
							{
								label: t('common.test'),
								onClick: onTest
							},
							{
								label: t('common.publishToFile'),
								onClick: onPublish
							},
							{
								label: t('common.duplicate'),
								onClick: onDuplicate
							}
						]}
						label={t('common.more')}
					/>
				</ButtonBar>
			</Card>
		</div>
	);
};
