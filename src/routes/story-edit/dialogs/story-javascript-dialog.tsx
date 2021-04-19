import classNames from 'classnames';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {
	DialogCard,
	DialogCardProps,
	DialogEditor
} from '../../../components/container/dialog-card';
import {CodeArea} from '../../../components/control/code-area';
import {usePrefsContext} from '../../../store/prefs';
import {
	storyWithId,
	updateStory,
	useStoriesContext
} from '../../../store/stories';
import './story-javascript-dialog.css';

export interface StoryJavaScriptDialogProps
	extends Omit<DialogCardProps, 'headerLabel'> {
	storyId: string;
}

export const StoryJavaScriptDialog: React.FC<StoryJavaScriptDialogProps> = props => {
	const {storyId, ...other} = props;
	const {dispatch, stories} = useStoriesContext();
	const {prefs} = usePrefsContext();
	const story = storyWithId(stories, storyId);
	const {t} = useTranslation();

	const className = classNames('story-javascript-dialog', {
		collapsed: other.collapsed
	});
	const handleChange = (
		editor: CodeMirror.Editor,
		data: CodeMirror.EditorChange,
		text: string
	) => {
		dispatch(updateStory(stories, story, {script: text}));
	};

	return (
		<div className={className}>
			<DialogCard {...other} headerLabel={t('storyJavaScript.title')}>
				<p>{t('storyJavaScript.explanation')}</p>
				<DialogEditor>
					<CodeArea
						fontFamily={prefs.javascriptEditorFontFamily}
						fontScale={prefs.javascriptEditorFontScale}
						onBeforeChange={handleChange}
						options={{autofocus: true, mode: 'js'}}
						value={story.script}
					/>
				</DialogEditor>
			</DialogCard>
		</div>
	);
};
