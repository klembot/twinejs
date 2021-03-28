import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {ButtonCard} from '../container/button-card';
import {CardActions, CardBody, CardHeader, CardProps} from '../container/card';
import {DropdownButton} from '../control/dropdown-button';
import {ImageCard} from '../container/image-card';
import {IconButton} from '../control/icon-button';
import {StoryPreview} from './story-preview';
import {Story} from '../../store/stories';
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
			<ImageCard image={<StoryPreview story={story} />} {...otherProps}>
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
				<CardActions>
					<DropdownButton
						icon="more-horizontal"
						label={t('common.more')}
					>
						<ButtonCard>
							<IconButton
								icon="play"
								label={t('common.play')}
								onClick={onPlay}
							/>
							<IconButton
								icon="tool"
								label={t('common.test')}
								onClick={onTest}
							/>
							<IconButton
								icon="download"
								label={t('common.publishToFile')}
								onClick={onPublish}
							/>
							<IconButton
								icon="edit-3"
								label={t('common.rename')}
								onClick={onRename}
							/>
						</ButtonCard>
					</DropdownButton>
					<IconButton
						icon="edit"
						label={t('common.edit')}
						onClick={onEdit}
						variant="primary"
					/>
				</CardActions>
			</ImageCard>
		</div>
	);
};
