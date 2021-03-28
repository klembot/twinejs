import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {Prompt, useHistory, useParams} from 'react-router-dom';
import {MainContent} from '../../components/container/main-content';
import {TopBar} from '../../components/container/top-bar';
import {CodeArea} from '../../components/control/code-area';
import {FontSelect} from '../../components/control/font-select';
import {IconButton} from '../../components/control/icon-button';
import {setPref, usePrefsContext} from '../../store/prefs';
import {storyWithId, updateStory, useStoriesContext} from '../../store/stories';
import './story-stylesheet-route.css';

export const StoryStylesheetRoute: React.FC = () => {
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const {dispatch: storiesDispatch, stories} = useStoriesContext();
	const {storyId} = useParams<{storyId: string}>();
	const story = storyWithId(stories, storyId);
	const [editedText, setEditedText] = React.useState(story.stylesheet);
	const history = useHistory();
	const {t} = useTranslation();
	const handleChange = (
		editor: CodeMirror.Editor,
		data: CodeMirror.EditorChange,
		text: string
	) => {
		setEditedText(text);
	};

	// TODO: this doesn't catch all instances (reload, go somewhere else entirely)
	// needs either a save button or moved to a modal.

	const handleLeave = () => {
		updateStory(storiesDispatch, stories, story, {stylesheet: editedText});
		return true;
	};

	return (
		<div className="story-stylesheet-route">
			<Prompt message={handleLeave} />
			<TopBar>
				<IconButton
					icon="arrow-left"
					label={story.name}
					onClick={() => history.push(`/stories/${story.id}`)}
					variant="primary"
				/>
			</TopBar>
			<MainContent>
				<h1>{t('storyStylesheet.title')}</h1>
				<p>{t('storyStylesheet.explanation')}</p>
				<FontSelect
					fontFamily={prefs.stylesheetEditorFontFamily}
					fontScale={prefs.stylesheetEditorFontScale}
					onChangeFamily={value =>
						setPref(
							prefsDispatch,
							'stylesheetEditorFontFamily',
							value
						)
					}
					onChangeScale={value =>
						setPref(
							prefsDispatch,
							'stylesheetEditorFontScale',
							value
						)
					}
				/>
				<CodeArea
					fontFamily={prefs.stylesheetEditorFontFamily}
					fontScale={prefs.stylesheetEditorFontScale}
					onBeforeChange={handleChange}
					options={{autofocus: true, mode: 'css'}}
					value={editedText}
				/>
			</MainContent>
		</div>
	);
};
