import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {StoryImportCard} from '../../components/story/story-import-card';
import {CardGroup} from '../../components/container/card-group';
import {Story} from '../../store/stories';

/**
 * How wide a story card should render onscreen as.
 */
const cardWidth = '450px';

export interface StoryImportListProps {
	onChangeSelectedIds: (value: string[]) => void;
	selectedIds: string[];
	stories: Story[];
}

export const StoryImportList: React.FC<StoryImportListProps> = props => {
	const {onChangeSelectedIds, selectedIds, stories} = props;
	const {t} = useTranslation();

	function handleChangeSelect(story: Story, value: boolean) {
		if (value) {
			onChangeSelectedIds([...selectedIds, story.id]);
		} else {
			onChangeSelectedIds(selectedIds.filter(id => id !== story.id));
		}
	}

	return (
		<div className="story-import-list">
			<p>{t('routes.storyImport.choosePrompt')}</p>
			<CardGroup columnWidth={cardWidth}>
				{stories.map(story => (
					<StoryImportCard
						key={story.name}
						onChangeSelect={value => handleChangeSelect(story, value)}
						selected={selectedIds.includes(story.id)}
						story={story}
					/>
				))}
			</CardGroup>
		</div>
	);
};
