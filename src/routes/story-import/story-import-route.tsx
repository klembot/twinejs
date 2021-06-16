import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {MainContent} from '../../components/container/main-content';
import {importStories, useStoriesContext, Story} from '../../store/stories';
import {storyFilename} from '../../util/publish';
import {StoryImportList} from './story-import-list';
import {StoryImportTopBar} from './top-bar';
import {UploadFile} from './upload-file';

// TODO: warn users on replacement of existing stories
// TODO: show warning on story card
// TODO: automatically import single story if no conflict

export const StoryImportRoute: React.FC = () => {
	const [file, setFile] = React.useState<File>();
	const history = useHistory();
	const [stories, setStories] = React.useState<Story[]>([]);
	const {dispatch, stories: existingStories} = useStoriesContext();
	const [idsToImport, setIdsToImport] = React.useState<string[]>([]);
	const {t} = useTranslation();

	function handleFileChange(file: File, stories: Story[]) {
		setFile(file);
		setStories(stories);
		setIdsToImport(
			stories.reduce<string[]>((result, story) => {
				if (
					existingStories.some(
						existingStory =>
							storyFilename(existingStory) === storyFilename(story)
					)
				) {
					return result;
				}

				return [...result, story.id];
			}, [])
		);
	}

	function handleFileClear() {
		setFile(undefined);
		setStories([]);
	}

	function handleImport() {
		dispatch(importStories(stories, existingStories));
		history.push('/');
	}

	let content = <UploadFile onChange={handleFileChange} />;

	if (file) {
		content = (
			<StoryImportList
				onChangeSelectedIds={setIdsToImport}
				selectedIds={idsToImport}
				stories={stories}
			/>
		);
	}

	return (
		<div className="story-import-route">
			<StoryImportTopBar
				file={file}
				onClearFile={handleFileClear}
				onDeselectAll={() => setIdsToImport([])}
				onImportSelected={handleImport}
				onSelectAll={() => setIdsToImport(stories.map(s => s.id))}
				idsToImport={idsToImport}
				stories={stories}
			/>
			<MainContent title={t('storyImport.title')}>{content}</MainContent>
		</div>
	);
};
