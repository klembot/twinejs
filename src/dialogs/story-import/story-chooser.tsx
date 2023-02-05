import {IconFileImport} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {CheckboxButton} from '../../components/control/checkbox-button';
import {IconButton} from '../../components/control/icon-button';
import {storyFileName} from '../../electron/shared';
import {Story} from '../../store/stories';
import './story-chooser.css';

export interface StoryChooserProps {
	existingStories: Story[];
	onImport: (stories: Story[]) => void;
	stories: Story[];
}

export const StoryChooser: React.FC<StoryChooserProps> = props => {
	const {existingStories, onImport, stories} = props;
	const [selectedStories, setSelectedStories] = React.useState<Story[]>([]);
	const {t} = useTranslation();

	// Whenever either existing stories or stories to import changes, select all
	// stories that do not conflict.

	const willReplaceExisting = React.useCallback(
		(story: Story) => {
			return existingStories.some(
				other => storyFileName(other) === storyFileName(story)
			);
		},
		[existingStories]
	);

	React.useEffect(() => {
		setSelectedStories(stories.filter(story => !willReplaceExisting(story)));
	}, [stories, willReplaceExisting]);

	function handleChange(story: Story, selected: boolean) {
		if (selected) {
			setSelectedStories(current => [...current, story]);
		} else {
			setSelectedStories(current =>
				current.filter(other => other.id !== story.id)
			);
		}
	}

	return (
		<div className="story-chooser">
			<p>{t('dialogs.storyImport.storiesPrompt')}</p>
			<ul>
				{stories.map(story => (
					<li key={story.id}>
						<CheckboxButton
							label={story.name}
							onChange={selected => handleChange(story, selected)}
							value={selectedStories.includes(story)}
						/>
						{selectedStories.includes(story) && willReplaceExisting(story) && (
							<span className="replace-warning">
								{t('dialogs.storyImport.willReplaceExisting')}
							</span>
						)}
					</li>
				))}
			</ul>
			<div className="actions">
				<IconButton
					disabled={selectedStories.length === 0}
					icon={<IconFileImport />}
					label={t('dialogs.storyImport.importSelected')}
					onClick={() => onImport(selectedStories)}
					variant="primary"
				/>
			</div>
		</div>
	);
};
