import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IndentButtons, UndoRedoButtons} from '../components/codemirror';
import {ButtonBar} from '../components/container/button-bar';
import {DialogCard, DialogEditor} from '../components/container/dialog-card';
import {CodeArea} from '../components/control/code-area';
import {usePrefsContext} from '../store/prefs';
import {storyWithId, updateStory, useStoriesContext} from '../store/stories';
import {codeMirrorOptionsFromPrefs} from '../util/codemirror-options';
import {DialogComponentProps} from './dialogs.types';
import './story-stylesheet.css';

export interface StoryStylesheetDialogProps extends DialogComponentProps {
	storyId: string;
}

export const StoryStylesheetDialog: React.FC<StoryStylesheetDialogProps> = props => {
	const {storyId, ...other} = props;
	const [cmEditor, setCmEditor] = React.useState<CodeMirror.Editor>();
	const {dispatch, stories} = useStoriesContext();
	const {prefs} = usePrefsContext();
	const story = storyWithId(stories, storyId);
	const {t} = useTranslation();

	const handleChangeText = (text: string) => {
		dispatch(updateStory(stories, story, {stylesheet: text}));
	};

	return (
		<DialogCard
			{...other}
			className="story-stylesheet-dialog"
			headerLabel={t('dialogs.storyStylesheet.title')}
			maximizable
		>
			{prefs.useCodeMirror && (
				<ButtonBar>
					<UndoRedoButtons editor={cmEditor} watch={story.script} />
					<IndentButtons editor={cmEditor} />
				</ButtonBar>
			)}
			<DialogEditor>
				<CodeArea
					editorDidMount={setCmEditor}
					fontFamily={prefs.codeEditorFontFamily}
					fontScale={prefs.codeEditorFontScale}
					id="story-stylesheet-dialog-code-area"
					label={t('dialogs.storyStylesheet.editorLabel')}
					labelHidden
					onChangeEditor={setCmEditor}
					onChangeText={handleChangeText}
					options={{
						...codeMirrorOptionsFromPrefs(prefs),
						autofocus: true,
						lineWrapping: true,
						mode: 'css',
						placeholder: t('dialogs.storyStylesheet.explanation')
					}}
					useCodeMirror={prefs.useCodeMirror}
					value={story.stylesheet}
				/>
			</DialogEditor>
		</DialogCard>
	);
};
