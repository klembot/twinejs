import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconDots, IconEdit, IconPlus, IconPlayerPlay} from '@tabler/icons';
import {
	Card,
	CardFooter,
	CardBody,
	CardHeader,
	CardProps
} from '../container/card';
import {ButtonBar} from '../container/button-bar';
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
			<Card {...otherProps}>
				<StoryPreview story={story} />
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
				<ButtonBar></ButtonBar>
				<ButtonBar>
					<IconButton
						icon={<IconEdit />}
						label={t('common.edit')}
						onClick={onEdit}
						variant="primary"
					/>
					<IconButton
						icon={<IconPlus />}
						label={t('common.tag')}
						onClick={onEdit}
					/>
					<IconButton
						icon={<IconPlayerPlay />}
						label={t('common.play')}
						onClick={onPublish}
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
							}
						]}
						label={t('common.more')}
					/>
				</ButtonBar>
			</Card>
		</div>
	);
};
