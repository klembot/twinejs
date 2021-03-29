import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useParams} from 'react-router-dom';
import {MainContent} from '../../components/container/main-content';
import {TopBar} from '../../components/container/top-bar';
import {CodeArea} from '../../components/control/code-area';
import {FontSelect} from '../../components/control/font-select';
import {IconButton} from '../../components/control/icon-button';
import {setPref, usePrefsContext} from '../../store/prefs';
import {storyWithId, updateStory, useStoriesContext} from '../../store/stories';
import './story-javascript-route.css';

export const StoryJavaScriptRoute: React.FC = () => {
	const {storyId} = useParams<{storyId: string}>();
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const {dispatch: storiesDispatch, stories} = useStoriesContext();
	const story = storyWithId(stories, storyId);
	const history = useHistory();
	const {t} = useTranslation();
	const handleChange = (
		editor: CodeMirror.Editor,
		data: CodeMirror.EditorChange,
		text: string
	) => {
		updateStory(storiesDispatch, stories, story, {script: text});
	};

	return (
		<div className="story-javascript-route">
			<TopBar>
				<IconButton
					icon="arrow-left"
					label={story.name}
					onClick={() => history.push(`/stories/${story.id}`)}
					variant="primary"
				/>
			</TopBar>
			<MainContent>
				<h1>{t('storyJavaScript.title')}</h1>
				<p>{t('storyJavaScript.explanation')}</p>
				<FontSelect
					fontFamily={prefs.passageEditorFontFamily}
					fontScale={prefs.passageEditorFontScale}
					onChangeFamily={(value) =>
						setPref(prefsDispatch, 'javascriptEditorFontFamily', value)
					}
					onChangeScale={(value) =>
						setPref(prefsDispatch, 'javascriptEditorFontScale', value)
					}
				/>
				<CodeArea
					fontFamily={prefs.javascriptEditorFontFamily}
					fontScale={prefs.javascriptEditorFontScale}
					onBeforeChange={handleChange}
					options={{autofocus: true, mode: 'js'}}
					value={story.script}
				/>
			</MainContent>
		</div>
	);
};
