import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {CardContent} from '../../components/container/card';
import {
	DialogCard,
	DialogCardProps
} from '../../components/container/dialog-card';
import {storyFileName} from '../../electron/shared';
import {importStories, Story, useStoriesContext} from '../../store/stories';
import {FileChooser} from './file-chooser';
import {StoryChooser} from './story-chooser';
import './story-import.css';

export type StoryImportDialogProps = Omit<DialogCardProps, 'headerLabel'>;

export const StoryImportDialog: React.FC<StoryImportDialogProps> = props => {
	const {onClose} = props;
	const {t} = useTranslation();
	const {dispatch, stories: existingStories} = useStoriesContext();
	const [file, setFile] = React.useState<File>();
	const [stories, setStories] = React.useState<Story[]>([]);

	function handleImport(stories: Story[]) {
		dispatch(importStories(stories, existingStories));
		onClose();
	}

	function handleFileChange(file: File, stories: Story[]) {
		// If there are no conflicts in the stories, import them now. Otherwise, set
		// them in state and let the user choose via <StoryChooser>.

		if (
			stories.length === 0 ||
			stories.some(story =>
				existingStories.some(
					existing => storyFileName(existing) === storyFileName(story)
				)
			)
		) {
			setFile(file);
			setStories(stories);
		} else {
			handleImport(stories);
		}
	}

	return (
		<DialogCard
			{...props}
			className="story-import-dialog"
			fixedSize
			headerLabel={t('dialogs.storyImport.title')}
		>
			<CardContent>
				<FileChooser onChange={handleFileChange} />
				{file && stories.length > 0 && (
					<StoryChooser
						existingStories={existingStories}
						onImport={handleImport}
						stories={stories}
					/>
				)}
				{file && stories.length === 0 && (
					<p>{t('dialogs.storyImport.noStoriesInFile')}</p>
				)}
			</CardContent>
		</DialogCard>
	);
};
