import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {CardFooter, CardBody, CardHeader, CardProps} from '../container/card';
import {MenuButton} from '../control/menu-button';
import {ImageCard} from '../container/image-card';
import {IconButton} from '../control/icon-button';
import {StoryPreview} from './story-preview';
import {Story} from '../../store/stories';
import {hueString} from '../../util/hue-string';
import './story-card.css';

const dateFormatter = new Intl.DateTimeFormat([]);

export interface StoryCardProps extends CardProps {
	// onDelete: () => void;
	// onDuplicate: () => void;
	onEdit: () => void;
	onPlay: () => void;
	onPublish: () => void;
	onRename: () => void;
	onTest: () => void;
	story: Story;
}

// TODO: implement story delete
// TODO: implement story duplicate

export const StoryCard: React.FC<StoryCardProps> = props => {
	const {
		onEdit,
		onPlay,
		onPublish,
		onRename,
		onTest,
		story,
		...otherProps
	} = props;
	const {t} = useTranslation();

	return (
		<div className="story-card">
			<ImageCard
				image={<StoryPreview story={story} />}
				tint={`hsla(${(hueString(story.name) + 45) % 360}, 90%, 40%, 0.025)`}
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
					<MenuButton
						icon="more-horizontal"
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
								label: t('common.rename'),
								onClick: onRename
							}
						]}
						label={t('common.more')}
					/>
					<IconButton
						icon="edit"
						label={t('common.edit')}
						onClick={onEdit}
						variant="primary"
					/>
				</CardFooter>
			</ImageCard>
		</div>
	);
};
