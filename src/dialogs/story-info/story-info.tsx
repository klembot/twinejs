import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {CheckboxButton} from '../../components/control/checkbox-button';
import {ButtonBar} from '../../components/container/button-bar';
import {CardContent} from '../../components/container/card';
import {DialogCard} from '../../components/container/dialog-card';
import {StoryFormatSelect} from '../../components/story-format/story-format-select';
import {storyWithId, updateStory, useStoriesContext} from '../../store/stories';
import {
	formatWithId,
	formatWithNameAndVersion,
	useStoryFormatsContext
} from '../../store/story-formats';
import {FormatLoader} from '../../store/format-loader';
import {DialogComponentProps} from '../dialogs.types';
import {RenameStoryButton} from '../../components/story/rename-story-button';
import {StoryInfoDialogStats} from './story-stats';

export interface StoryInfoDialogProps extends DialogComponentProps {
	storyId: string;
}

export const StoryInfoDialog: React.FC<StoryInfoDialogProps> = props => {
	const {storyId, ...other} = props;
	const {dispatch, stories} = useStoriesContext();
	const {formats} = useStoryFormatsContext();
	const story = storyWithId(stories, storyId);
	const {t} = useTranslation();

	function handleFormatChange(event: React.ChangeEvent<HTMLSelectElement>) {
		const newFormat = formatWithId(formats, event.target.value);

		dispatch(
			updateStory(stories, story, {
				storyFormat: newFormat.name,
				storyFormatVersion: newFormat.version
			})
		);
	}

	return (
		<DialogCard
			{...other}
			className="story-info-dialog"
			fixedSize
			headerLabel={story.name}
		>
			<ButtonBar>
				<RenameStoryButton
					existingStories={stories}
					onRename={name => dispatch(updateStory(stories, story, {name}))}
					story={story}
				/>
				<CheckboxButton
					label={t('dialogs.storyInfo.snapToGrid')}
					onChange={value =>
						dispatch(updateStory(stories, story, {snapToGrid: value}))
					}
					value={story.snapToGrid}
				/>
			</ButtonBar>
			<div className="story-format">
				<FormatLoader block={false} />
				<StoryFormatSelect
					formats={formats}
					onChange={handleFormatChange}
					selectedFormat={formatWithNameAndVersion(
						formats,
						story.storyFormat,
						story.storyFormatVersion
					)}
				>
					{t('common.storyFormat')}
				</StoryFormatSelect>
				<a
					href="https://twinery.org/2storyformats"
					target="_blank"
					rel="noreferrer"
				>
					{t('dialogs.storyInfo.storyFormatExplanation')}
				</a>
			</div>
			<CardContent>
				{!other.collapsed && <StoryInfoDialogStats story={story} />}
			</CardContent>
		</DialogCard>
	);
};
