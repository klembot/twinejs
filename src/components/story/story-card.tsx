import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconDots, IconEdit, IconPlayerPlay} from '@tabler/icons';
import {Card, CardContent, CardProps} from '../container/card';
import {ButtonBar} from '../container/button-bar';
import {MenuButton} from '../control/menu-button';
import {IconButton} from '../control/icon-button';
import {AddTagButton, TagButton} from '../tag';
import {StoryPreview} from './story-preview';
import {Story} from '../../store/stories';
import {Color} from '../../util/color';
import './story-card.css';

const dateFormatter = new Intl.DateTimeFormat([]);

export interface StoryCardProps extends CardProps {
	onDelete: () => void;
	// onDuplicate: () => void;
	onAddTag: (name: string, color: Color) => void;
	onEditTag: (oldName: string, newName: string, newColor: Color) => void;
	onEdit: () => void;
	onPlay: () => void;
	onPublish: () => void;
	onRename: () => void;
	onTest: () => void;
	story: Story;
	storyTagColors: Record<string, Color>;
}

// TODO: implement story delete
// TODO: implement story duplicate

export const StoryCard: React.FC<StoryCardProps> = props => {
	const {
		onAddTag,
		onDelete,
		onEdit,
		onEditTag,
		onPlay,
		onPublish,
		onRename,
		onTest,
		story,
		storyTagColors,
		...otherProps
	} = props;
	const {t} = useTranslation();

	return (
		<div className="story-card">
			<Card {...otherProps}>
				<StoryPreview story={story} />
				<CardContent>
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
					{story.tags && (
						<div className="tags">
							{story.tags.map(tag => (
								<TagButton
									color={storyTagColors[tag]}
									key={tag}
									name={tag}
									onDelete={() => {}}
									onEdit={(newName, newColor) =>
										onEditTag(tag, newName, newColor)
									}
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
					<AddTagButton onCreate={onAddTag} />
					<IconButton
						icon={<IconPlayerPlay />}
						label={t('common.play')}
						onClick={onPlay}
					/>
					<MenuButton
						icon={<IconDots />}
						items={[
							{
								label: t('common.test'),
								onClick: onTest
							},
							{
								label: t('common.publishToFile'),
								onClick: onPublish
							},
							{
								label: t('common.rename'),
								onClick: onRename
							},
							{
								label: t('common.delete'),
								onClick: onDelete
							}
						]}
						label={t('common.more')}
					/>
				</ButtonBar>
			</Card>
		</div>
	);
};
